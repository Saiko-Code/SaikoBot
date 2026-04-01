const Discord = require("discord.js")

module.exports = {

    name: "warn-list",
    description: "Affiche le ou les avertissement d'un membres 🪪",
    permission : Discord.PermissionFlagsBits.ManageMessages,
    dm : true,
    category : "Informations",
    options: [
        {
            type :"user",
            name :"membre",
            description :"Information des sanctions du membres",
            required : true,
            autocomplete : false
        }
    ],

    async run(bot, message, args, db) {

        let user = args.getUser("membre")
        if (!user) return message.reply("Pas de membre")
        let member = message.guild.members.cache.get(user.id)
        if(!member) return message.reply("Pas de membre !")

        bot.db.query(`SELECT * FROM warns WHERE guild = '${message.guildId}' AND user = '${user.id}'`, async (err, req) => {

            if(req.length < 1) return message.reply("Ce membre n'a pas de sanctions !")
            await req.sort((a, b) => parseInt(b.date) - parseInt(a.date))

            let Embed = new Discord.EmbedBuilder()
            .setColor(bot.color)
            .setDescription(`Les sanctions de **${user.tag}** LOSEEEEER !`)
            .setThumbnail(user.displayAvatarURL({dynamic: true}))
            .setTimestamp()
            .setFooter({ iconURL: bot.user.displayAvatarURL({dynamic: true}), text:"SaikoBot © 2023", })

            for(let i = 0; i < req.length; i++) {

                Embed.addFields([{name: `Sanctions n°${i+1}`, value: `> **Auteur** : ${(await bot.users.fetch(req[i].author)).tag}\n> **ID** : \`${req[i].warn}\`\n> **Raison** : \`${req[i].reason}\`\n> **Date** : <t:${Math.floor(parseInt(req[i].date) / 1000)}:F>`}])
            }

            await message.reply({embeds: [Embed]})
        })
    }
}
