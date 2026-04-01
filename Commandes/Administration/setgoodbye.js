const Discord = require("discord.js");

module.exports = {
    name: "setgoodbye",
    description: "Définit le salon des messages d’au revoir.",
    permission: Discord.PermissionFlagsBits.ManageChannels,
    dm: false,
    category: "Administration",
    options: [
        {
            type: "channel",
            name: "salon",
            description: "Le salon où envoyer les messages d’au revoir.",
            autocomplete: false,
            required: true
        }
    ],

    async run(bot, message, args) {
        try {
            let channel = args.getChannel("salon");
            if (!channel) return message.reply("❌ Salon invalide.");

            bot.db.query(
                `INSERT INTO \`welcome_goodbye\` (guild_id, guild_name, goodbye_channel_id) 
                 VALUES (?, ?, ?)
                 ON DUPLICATE KEY UPDATE goodbye_channel_id = ?`, 
                [message.guild.id, message.guild.name, channel.id, channel.id], 
                (err) => {
                    if (err) {
                        console.error(err);
                        return message.reply("❌ Erreur lors de l’enregistrement du salon d’au revoir.");
                    }
                    message.reply(`✅ Salon d’au revoir défini sur <#${channel.id}>`);
                }
            );
        } catch (err) {
            console.error(err);
            message.reply("❌ Une erreur s’est produite.");
        }
    }
};
