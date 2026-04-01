const { EmbedBuilder } = require("discord.js");

module.exports.generateServerEmbed = function (data) {
    
    // Détection du statut pour la couleur
    const isOnline = data.status.includes("En ligne");
    // Vert si en ligne, Rouge si hors ligne
    const statusColor = isOnline ? 0x10b981 : 0xef4444; 

    const embed = new EmbedBuilder()
        .setTitle(`${data.serverName}`)
        .setColor(statusColor)
        .setTimestamp();

    if (isOnline) {
        embed.setDescription("🟢 **Le serveur est actuellement en ligne**");
        
        embed.addFields(
            // --- LIGNE 1 : PERFORMANCES ---
            { 
                name: "💾 RAM", 
                value: `\`${data.ram}\``, 
                inline: true 
            },
            { 
                name: "🖥️ CPU", 
                value: `\`${data.cpu}\``, 
                inline: true 
            },
            { 
                name: "⏱️ TPS", 
                value: `\`${data.tps}\``, 
                inline: true 
            },

            // --- LIGNE 2 : CONNEXION ---
            { 
                name: "🔌 IP:Port", 
                value: `\`${data.ip}:${data.port}\``, 
                inline: true 
            },
            { 
                name: "📌 Version", 
                value: `\`${data.mcVersion}\``, 
                inline: true 
            },
            { 
                name: "🏓 Ping", 
                value: `\`${data.mcPing}\``, 
                inline: true 
            },

            // --- LIGNE 3 : JOUEURS ---
            { 
                name: `👥 Joueurs (${data.players})`, 
                value: `\`\`\`${data.playerList || "Aucun joueur"}\`\`\``, 
                inline: false 
            }
        );
        
        // Optionnel : Afficher le disque en footer ou dans un champ supplémentaire
        embed.setFooter({ text: `Disque utilisé : ${data.disk} • Pterodactyl Monitor` });

    } else {
        // --- AFFICHAGE HORS LIGNE ---
        embed.setDescription("🔴 **Le serveur est actuellement hors ligne**");
        embed.addFields(
            { name: "🔌 IP", value: `\`${data.ip}:${data.port}\``, inline: true },
            { name: "💾 RAM (Docker)", value: `\`${data.ram}\``, inline: true },
            { name: "Statut", value: "En attente de démarrage...", inline: false }
        );
    }

    return embed;
};