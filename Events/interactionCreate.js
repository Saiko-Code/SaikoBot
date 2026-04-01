const Discord = require("discord.js");
const axios = require("axios");

// -----------------------------------------------------
// RÔLES ET UTILISATEURS AUTORISÉS POUR PTERODACTYL
// -----------------------------------------------------
const ALLOWED_ROLE_ID = "835549680582000680";
const ALLOWED_USERS = [
    "282100145401626625",
    "462979104350797825",
];

// NOUVEAU : On importe le générateur d'Embed (et plus l'image)
const { generateServerEmbed } = require("../Utils/serverCards.js");

module.exports = async (bot, interaction) => {

    // =====================================================
    // 🔎 AUTOCOMPLETE (server-info + autres commandes)
    // =====================================================
    if (interaction.type === Discord.InteractionType.ApplicationCommandAutocomplete) {

        const focused = interaction.options.getFocused();
        const cmd = bot.commands.get(interaction.commandName);
        if (!cmd) return;

        // Autocomplete pour server-info
        if (interaction.commandName === "server-info") {
            try {
                const servers = await cmd.listServers(
                    process.env.PTERODACTYL_URL,
                    process.env.PTERODACTYL_API_KEY
                );

                const filtered = servers
                    .filter(s => s.name.toLowerCase().includes(focused.toLowerCase()))
                    .slice(0, 25);

                return interaction.respond(
                    filtered.map(s => ({ name: s.name, value: s.id }))
                );

            } catch (e) {
                console.error("Autocomplete server-info :", e);
                return interaction.respond([]);
            }
        }

        // Autocomplete /help
        if (interaction.commandName === "help") {
            return interaction.respond(
                bot.commands
                    .filter(c => c.name.includes(focused))
                    .map(c => ({ name: c.name, value: c.name }))
            );
        }

        // Autocomplete setcaptcha
        if (interaction.commandName === "setcaptcha") {
            return interaction.respond(
                ["on", "off"]
                    .filter(v => v.includes(focused))
                    .map(v => ({ name: v, value: v }))
            );
        }

        // Autocomplete setstatus
        if (interaction.commandName === "setstatus") {
            return interaction.respond(
                ["Listening", "Watching", "Playing", "Streaming", "Competing"]
                    .filter(v => v.includes(focused))
                    .map(v => ({ name: v, value: v }))
            );
        }

        return;
    }

    // =====================================================
    // ▶ SLASH COMMAND
    // =====================================================
    if (interaction.type === Discord.InteractionType.ApplicationCommand) {

        const cmd = bot.commands.get(interaction.commandName);
        if (!cmd) return;

        try {
            await cmd.run(bot, interaction, interaction.options, bot.db);
        } catch (err) {
            console.error(err);
            return interaction.reply({
                content: "Erreur lors de l’exécution de la commande.",
                ephemeral: true
            });
        }

        return;
    }

    // =====================================================
    // 🟦 BOUTONS : SYSTEME PTERODACTYL (server-info)
    // =====================================================
    if (interaction.isButton()) {

        // Vérification si c'est un bouton Ptero
        if (interaction.customId.includes("_") && !interaction.customId.startsWith("ticket") && !interaction.customId.startsWith("close")) {
            
            const [action, serverId] = interaction.customId.split("_");
            const valid = ["start", "stop", "restart", "refresh"];
            if (!valid.includes(action)) return;

            // Check permission
            const member = await interaction.guild.members.fetch(interaction.user.id);
            const canUse =
                member.roles.cache.has(ALLOWED_ROLE_ID) ||
                ALLOWED_USERS.includes(member.id);

            if (!canUse) {
                return interaction.reply({
                    content: "❌ Tu n’as pas la permission d’utiliser ces boutons.",
                    ephemeral: true
                });
            }

            await interaction.deferUpdate();

            const panelUrl = process.env.PTERODACTYL_URL;
            const apiKey = process.env.PTERODACTYL_API_KEY;
            const serverInfoCmd = bot.commands.get("server-info");

            try {
                // Si ce n’est pas juste un refresh → envoi du signal power
                if (action !== "refresh") {
                    await axios.post(
                        `${panelUrl}/api/client/servers/${serverId}/power`,
                        { signal: action },
                        {
                            headers: {
                                Authorization: `Bearer ${apiKey}`,
                                "Content-Type": "application/json",
                                Accept: "application/json"
                            }
                        }
                    );
                }

                // Embed temporaire "Mise à jour..."
                await interaction.editReply({
                    files: [], // On vide les fichiers
                    embeds: [
                        new Discord.EmbedBuilder()
                            .setTitle("⏳ Mise à jour du serveur...")
                            .setColor("#ffaa00")
                    ],
                    components: []
                });

                if (action !== "refresh")
                    await new Promise(r => setTimeout(r, 3000));

                // Récupération des infos mises à jour
                const data = await serverInfoCmd.fetchServerStatus(
                    panelUrl,
                    apiKey,
                    serverId
                );

                // NOUVEAU : On génère l'Embed de mise à jour au lieu de l'image
                const embed = generateServerEmbed(data);

                // Boutons mis à jour
                const row = new Discord.ActionRowBuilder().addComponents(
                    new Discord.ButtonBuilder()
                        .setCustomId(`start_${serverId}`)
                        .setLabel("Démarrer")
                        .setStyle(Discord.ButtonStyle.Success),
                    new Discord.ButtonBuilder()
                        .setCustomId(`stop_${serverId}`)
                        .setLabel("Arrêter")
                        .setStyle(Discord.ButtonStyle.Danger),
                    new Discord.ButtonBuilder()
                        .setCustomId(`restart_${serverId}`)
                        .setLabel("Redémarrer")
                        .setStyle(Discord.ButtonStyle.Primary),
                    new Discord.ButtonBuilder()
                        .setCustomId(`refresh_${serverId}`)
                        .setLabel("Actualiser")
                        .setStyle(Discord.ButtonStyle.Secondary)
                );

                // Réponse finale (Embed + boutons)
                await interaction.editReply({
                    files: [], // Pas de fichier pour l'embed
                    components: [row],
                    embeds: [embed] // On remplace l'embed temporaire par le vrai embed
                });

            } catch (e) {
                console.error("Erreur Pterodactyl :", e);

                return interaction.followUp({
                    content: "❌ Impossible de mettre à jour les informations.",
                    ephemeral: true
                });
            }
            return;
        }

        // =====================================================
        // 🎟 SYSTÈME DE TICKETS
        // =====================================================
        if (interaction.customId === "ticket") {

            const channel = await interaction.guild.channels.create({
                name: `ticket-${interaction.user.username}`,
                type: Discord.ChannelType.GuildText
            });

            await channel.setParent(interaction.channel.parentId);

            await channel.permissionOverwrites.create(interaction.guild.roles.everyone, { ViewChannel: false });
            await channel.permissionOverwrites.create(interaction.user.id, { ViewChannel: true });
            await channel.permissionOverwrites.create("282100145401626625", { ViewChannel: true });

            await channel.setTopic(interaction.user.id);

            await interaction.reply({
                content: `Ton ticket a été créé : <#${channel.id}>`,
                ephemeral: true
            });

            const embed = new Discord.EmbedBuilder()
                .setColor(bot.color)
                .setTitle("Ticket ouvert")
                .setDescription("Explique ton problème avec un maximum de détails.")
                .setTimestamp();

            const row = new Discord.ActionRowBuilder().addComponents(
                new Discord.ButtonBuilder()
                    .setCustomId("close")
                    .setLabel("Fermer le ticket")
                    .setStyle(Discord.ButtonStyle.Danger)
                    .setEmoji("🗑️")
            );

            await channel.send({ embeds: [embed], components: [row] });
        }

        if (interaction.customId === "close") {
            const user = bot.users.cache.get(interaction.channel.topic);
            try { await user.send("Ton ticket a été fermé."); } catch {}
            await interaction.channel.delete();
        }
    }
};