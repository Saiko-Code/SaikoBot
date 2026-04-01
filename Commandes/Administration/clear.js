const Discord = require("discord.js");

module.exports = {

    name: "clear",
    description: "Supprimer un nombre défini de messages dans un channel 🧹",
    permission: Discord.PermissionFlagsBits.ManageMessages,
    dm: false,
    category: "Le ménage",
    options: [
        {
            type: "number",
            name: "number",
            description: "Le nombre de messages à supprimer.",
            required: true,
            autocomplete: false
        }, {
            type: "channel",
            name: "channel",
            description: "  Le channel où supprimer les messages.",
            required: true,
            autocomplete: false
        }
    ],

    async run(bot, message, args) {

        let channel = args.getChannel("channel")
        if (!channel) channel = message.channel;
        if (channel.id !== message.channel.id && !message.guild.channels.cache.get(channel.id)) return message.reply("Pas de channel trouvé !")

        let number = args.getNumber("number") + 1
        if (parseInt(number) <= 0 || parseInt(number) > 100) return message.reply("Il faut un number entre 0 et 100 inclut !")

        try {
            let messages = await channel.bulkDelete(parseInt(number))

            const clearCommandEmbed = new Discord.EmbedBuilder()
                .setColor(bot.color)
                .setTitle(`${message.guild.name} - Commande ${this.name}`)
                .setDescription("Clear")
                .setTimestamp()
                .addFields({ name: 'Nombre de messages supprimé', value: `${messages.size}` })
                .addFields({ name: 'Salon', value: `${channel}` })
                .setFooter({ text: `Demandé par ${message.user.tag}`})
            await message.reply({ embeds: [clearCommandEmbed] })

        } catch (err) {

            let messages = [...(await channel.messages.fetch()).filter(msg => !msg.interaction && (Date.now() - msg.createdAt) <= 1209600000).values()]
            if (messages.length <= 0) return message.reply({ content: "Aucun message à supprimer car ils datent tous de plus de 14 jours !", ephemeral: true })
            await channel.bulkDelete(messages)

            const clearCommandEmbed = new Discord.EmbedBuilder()
                .setColor(bot.defaultColor)
                .setTitle(`${message.guild.name} - Commande ${this.name}`)
                .setDescription(this.description)
                .addFields({ name: 'Nombre de messages supprimé', value: `${messages.size}` })
                .addFields({ name: 'Salon', value: `${channel}` })
                .setFooter({ text: `Demandé par ${message.user.tag}` })
            await message.reply({ embeds: [clearCommandEmbed] })
        }
    }
}