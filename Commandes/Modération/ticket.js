const Discord = require("discord.js")

module.exports = {

    name: 'ticket',
    description: "Crée un ticket pour contacter un modérateur si tu rencontres un problème.",
    premission: Discord.PermissionFlagsBits.ManageGuild,
    dm: false,
    category: "Modération",
    options: [],

    async run(bot, message, args, db) {

        let Embed = new Discord.EmbedBuilder()
        .setColor(bot.color)
        .setTitle("Création d'un ticket !")
        .setThumbnail(bot.user.displayAvatarURL({dynamic: true}))
        .setDescription(`Crée une conversation privée avec un modérateur si tu rencontres un problème sur le serveur !`)
        .setTimestamp()
        .setFooter({ iconURL: bot.user.displayAvatarURL({dynamic: true}), text:"SaikoBot © 2023", })

        const btn = new Discord.ActionRowBuilder().addComponents(new Discord.ButtonBuilder()
        .setCustomId("ticket")
        .setLabel("Créer un ticket")
        .setStyle(Discord.ButtonStyle.Primary)
        .setEmoji("📩"))

        await message.reply({embeds: [Embed], components: [btn] })
    }
}