const { MessageActivityType } = require("discord.js")
const Discord = require("discord.js")

module.exports = {

    name: "unban",
    description: "Débanni un membre ✅",
    permission: Discord.PermissionFlagsBits.BanMembers,
    dm: false,
    category: "Modération",
    options: [
        {
            type: "user",
            name: "utilisateur",
            description: "L'utilisateur à débannir",
            autocomplete: false,
            required: true
        }, {
            type: "string",
            name: "raison",
            description: "La raison du débanissement",
            autocomplete: false,
            required: true
        }
    ],

    async run(bot, message, args) {

        try {

            let user = args.getUser("utilisateur")
            if(!user) return message.reply("Pas d'utilisateur !")

            let reason = args.getString("raison")
            if(!reason) reason = "Pas de raison fournie.";

            if(!(await message.guild.bans.fetch()).get(user.id)) return message.reply("Cet utilisateur n'est pas banni !")

            try {await user.send(`Tu as été débanni du serveur ${message.guild.name} par ${message.user.tag} pour la raison : \`${reason}\` \nPS: On te laisse une chance ne la gache pas man !`)} catch(err) {}
           
            let Embed = new Discord.EmbedBuilder()
             .setColor(bot.color)
             .setTitle("Un membre à été débanni !")
             .setThumbnail(bot.user.displayAvatarURL({dynamic: true}))
             .setDescription(`${user.tag} a été débanni. \nRaison : \`${reason}\` \nModérateur : \`${message.user.tag}\` \nDescription : Bon retour parmis nous j'espère que tu sera plus chill man !`)
             .setTimestamp()
             .setFooter({ iconURL:"https://i.imgur.com/L94flCQ.jpeg", text:"SaikoBot © 2023", })
 
             await message.reply({embeds: [Embed]})

             await message.guild.members.unban(user, reason)

        } catch (err) {

            return message.reply("Pas d'utilisateur !")
        }

    }
}