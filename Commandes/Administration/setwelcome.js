const Discord = require("discord.js");

module.exports = {
    name: "setwelcome",
    description: "Définit le salon des messages de bienvenue.",
    permission: Discord.PermissionFlagsBits.ManageChannels,
    dm: false,
    category: "Administration",
    options: [
        {
            type: "channel",
            name: "salon",
            description: "Le salon où envoyer les messages de bienvenue.",
            autocomplete: false,
            required: true
        }
    ],

    async run(bot, message, args) {
        try {
            let channel = args.getChannel("salon");
            if (!channel) return message.reply("❌ Salon invalide.");

            let guildId = message.guild.id;
            let guildName = message.guild.name;
            let channelId = channel.id;

            bot.db.query(
                `INSERT INTO \`welcome_goodbye\` (guild_id, guild_name, welcome_channel_id) 
                 VALUES (?, ?, ?) 
                 ON DUPLICATE KEY UPDATE guild_name = ?, welcome_channel_id = ?`, 
                [guildId, guildName, channelId, guildName, channelId], 
                (err) => {
                    if (err) {
                        console.error(err);
                        return message.reply("❌ Erreur lors de l’enregistrement du salon de bienvenue.");
                    }
                    message.reply(`✅ Salon de bienvenue défini sur <#${channelId}> pour le serveur **${guildName}**`);
                }
            );
        } catch (err) {
            console.error(err);
            message.reply("❌ Une erreur s’est produite.");
        }
    }
};
