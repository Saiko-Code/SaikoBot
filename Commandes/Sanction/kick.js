const Discord = require("discord.js")

module.exports = {

    name: "kick",
    description: "Te kick du serveur quand tu casses trop les couilles 🤣",
    permission: Discord.PermissionFlagsBits.KickMembers,
    dm: false,
    category: "Modération",
    options: [
        {
            type: "user",
            name: "membre",
            description: "Le membre à kick",
            autocomplete: false,
            required: true
        }, {
            type: "string",
            name: "raison",
            description: "La raison du kick",
            autocomplete: false,
            required: true
        }
    ],

    async run(bot, message, args) {

        let user = args.getUser("membre")
        if(!user) return message.reply("Pas de membre à kick !")
        let member = message.guild.members.cache.get(user.id)
        if(!member) return message.reply("Pas de membre à kick !")
            
        let reason = args.getString("raison")
        if(!reason) reason = "Pas de raison fournie.";

        if(message.user.id === user.id) return message.reply("N'essaie pas de te bannir !")
        if((await message.guild.fetchOwner()).id === user.id) return message.reply("Ne kick pas le chef du serveur !")
        if(member && !member.kickable) return message.reply("Je ne peux pas kick ce membre !")
        if(member && message.member.roles.highest.comparePositionTo(member.roles.highest) <= 0) return message.reply("Tu ne peut pas kick cette personne !")

        try {await user.send(`Tu as été kick du serveur ${message.guild.name} par ${message.user.tag} pour la raison : \`${reason}\` \nPS: Tu reviendras quand tu te seras calmer `)} catch(err) {}

        let Embed = new Discord.EmbedBuilder()
        .setColor(bot.color)
        .setTitle("Un membre à été kick !")
        .setThumbnail(bot.user.displayAvatarURL({dynamic: true}))
        .setDescription(`${user.tag} a été kick. \nRaison : \`${reason}\` \nModérateur : \`${message.user.tag}\` \nPs: tu reviendras quand tu te seras calmer`)
        .setTimestamp()
        .setFooter({ iconURL:"https://i.imgur.com/L94flCQ.jpeg", text:"SaikoBot © 2023", })

        await message.reply({embeds: [Embed]})

        await member.kick(reason)
            
    }
}