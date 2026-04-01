const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const axios = require("axios");
const util = require("minecraft-server-util");

// On importe le générateur d'Embed
const { generateServerEmbed } = require("../../Utils/serverCards.js");

const ALLOWED_ROLE_ID = "835549680582000680";
const ALLOWED_USERS = ["282100145401626625", "462979104350797825"];

module.exports = {
    name: "server-info",
    description: "Affiche l'état avancé (TPS, RAM Java) d'un serveur Pterodactyl.",
    permission: "Aucune",
    dm: true,
    category: "Informations",

    options: [
        {
            type: "string",
            name: "serveur_id",
            description: "Sélectionne un serveur Pterodactyl",
            required: true,
            autocomplete: true
        }
    ],

    async listServers(panelUrl, apiKey) {
        try {
            const res = await axios.get(`${panelUrl}/api/client`, {
                headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" }
            });
            return res.data.data.map(srv => ({
                name: srv.attributes.name,
                id: srv.attributes.identifier
            }));
        } catch (error) { return []; }
    },

    // =========================================================
    // TPS & RAM (Port 51218 défini dans ton .env)
    // =========================================================
    async fetchExporterStats() {
        const exporterAddress = process.env.FABRIC_EXPORTER; 
        if (!exporterAddress) return { available: false };

        try {
            const { data } = await axios.get(`http://${exporterAddress}/metrics`, { timeout: 2000 });
            
            const tpsMatch = data.match(/fabric_server_tps_1m ([\d\.]+)/) || data.match(/minecraft_server_tps_1_minute ([\d\.]+)/);
            const ramMatch = data.match(/jvm_memory_bytes_used\{area="heap",\}\s+([\d\.E]+)/);

            let totalPlayers = 0;
            const playerMatches = [...data.matchAll(/minecraft_players_online\{world=".*?",\}\s+([\d\.]+)/g)];
            if (playerMatches.length > 0) {
                playerMatches.forEach(match => totalPlayers += parseFloat(match[1]));
            } else {
                const simpleMatch = data.match(/minecraft_players_count ([\d]+)/);
                if (simpleMatch) totalPlayers = parseInt(simpleMatch[1]);
            }

            return {
                available: true,
                tps: tpsMatch ? parseFloat(tpsMatch[1]).toFixed(2) : "20.00",
                ramBytes: ramMatch ? parseFloat(ramMatch[1]) : 0,
                playerCount: totalPlayers
            };
        } catch (e) {
            console.error("Erreur TPS (Vérifie l'IP et le port 51218 dans ton .env)");
            return { available: false };
        }
    },

    formatMemory(bytes) {
        if (!bytes || isNaN(bytes)) return "0 MB";
        const mb = bytes / 1024 / 1024;
        return mb < 1024 ? `${mb.toFixed(0)} MB` : `${(mb / 1024).toFixed(2)} GB`;
    },

    async fetchServerStatus(panelUrl, apiKey, serverId) {
        if (!serverId || serverId === "null") throw new Error("ID invalide.");

        const serverRes = await axios.get(`${panelUrl}/api/client/servers/${serverId}`, {
            headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" }
        });
        const data = serverRes.data?.attributes;
        if (!data) throw new Error("SERVER_NOT_FOUND");

        const allocation = data.relationships.allocations.data.find(a => a.attributes.is_default)?.attributes;
        const ip = allocation?.ip_alias || allocation?.ip;
        const gamePort = allocation?.port;

        const liveRes = await axios.get(`${panelUrl}/api/client/servers/${serverId}/resources`, {
            headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" }
        });
        const live = liveRes.data.attributes;
        const state = live.current_state;

        const statusText = state === "running" ? "🟢 En ligne" : "🔴 Hors ligne";

        let cpu = "0%"; let ram = "0 GB"; let disk = "0 GB";
        let players = "Hors ligne"; let playerList = "Indisponible";
        let mcPing = "-"; let mcVersion = "-"; let tps = "-"; 

        if (state === "running" || state === "starting") {
            cpu = `${(live.resources.cpu_absolute).toFixed(1)}%`;
            disk = this.formatMemory(live.resources.disk_bytes);
            
            const exporterData = await this.fetchExporterStats();
            if (exporterData.available) {
                tps = exporterData.tps;
                ram = `${this.formatMemory(exporterData.ramBytes)} (Java)`;
                players = `${exporterData.playerCount} connectés`;
            } else {
                ram = `${this.formatMemory(live.resources.memory_bytes)}`;
            }

            // =========================================================
            // PING DIRECT SUR LE PORT DU JEU (51220)
            // C'est ce qui répare Ping, Version et Joueurs
            // =========================================================
            try {
                // gamePort est le port que tes joueurs utilisent (51220)
                const mc = await util.status(ip, 51222, { timeout: 2500 });
                
                mcPing = `${mc.roundTripLatency}ms`;
                mcVersion = mc.version.name;

                if (!exporterData.available) {
                    players = `${mc.players.online} / ${mc.players.max}`;
                }

                if (mc.players.sample && mc.players.sample.length > 0) {
                    // util.status renvoie des objets {name, id}
                    playerList = mc.players.sample.map(p => `• ${p.name}`).join("\n");
                } else if (mc.players.online > 0) {
                    playerList = "Joueurs en ligne (Noms masqués)";
                } else {
                    playerList = "Aucun joueur";
                }

            } catch (e) {
                if (!exporterData.available) players = "Injoignable";
            }
        }

        return {
            serverName: data.name, ip, port: gamePort, status: statusText,
            cpu, ram, disk, players, playerList, mcPing, mcVersion, tps 
        };
    },

    async run(bot, interaction) {
        try {
            await interaction.deferReply();
            const serverId = interaction.options.getString("serveur_id");
            if (!serverId) return interaction.editReply("❌ Serveur invalide.");

            const stats = await this.fetchServerStatus(process.env.PTERODACTYL_URL, process.env.PTERODACTYL_API_KEY, serverId);
            const embed = generateServerEmbed(stats);

            let components = [];
            components = [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId(`start_${serverId}`).setLabel("Start").setStyle(ButtonStyle.Success),
                    new ButtonBuilder().setCustomId(`stop_${serverId}`).setLabel("Stop").setStyle(ButtonStyle.Danger),
                    new ButtonBuilder().setCustomId(`restart_${serverId}`).setLabel("Restart").setStyle(ButtonStyle.Primary)
                ),
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId(`refresh_${serverId}`).setLabel("Actualiser").setStyle(ButtonStyle.Secondary)
                )
            ];

            return interaction.editReply({ embeds: [embed], files: [], components });
        } catch (err) {
            return interaction.editReply("❌ **Erreur :** Impossible de récupérer les informations.");
        }
    }
};