const Discord = require("discord.js")
const ms = require("ms")

module.exports = {

    name: "unmute",
    description: "Te unmute si ta arrêter de flop 🥰",
    permission : Discord.PermissionFlagsBits.ModerateMembers,
    dm : false,
    category: "Modération",
    options : [
        {
            type: "user",
            name: "membre",
            description: "le membre à unmute",
            autocomplete: false,
            required: true
        }, {
            type: "string",
            name: "raison",
            description: "La raison du unmute",
            autocomplete: false,
            required: true
        }
    ],

    async run(bot, message, args) {

        let user =args.getUser("membre");
        if(!user) return message.reply("Pas de membre !")
        let member = message.guild.members.cache.get(user.id)
        if(!member) return message.reply("Pas de membre !")

        let reason = args.getString("raison")
        if(!reason) reason = "Pas de raison fournie.";
        
        if(!member.moderatable) return message.reply("Je ne peut pas unmute cette personne !")
        if(message.member.roles.highest.comparePositionTo(member.roles.highest) <=0) return message.reply("Vous ne pouvez pas unmute cette personne !")
        if(!member.isCommunicationDisabled()) return message.reply("Ce membre n'est pas au coin !")

        try {await user.send(`Tu peut à nouveau parler sur ${message.guild.name} par ${message.user.tag} pour la raison : \`${reason}\` \nPS: Ne flop plus si tu veux pas être mute à nouveau ^^`)} catch(err) {}

        let Embed = new Discord.EmbedBuilder()
        .setColor(bot.color)
        .setTitle("Un membre peut à nouveau parler")
        .setThumbnail(bot.user.displayAvatarURL({dynamic: true}))
        .setDescription(`${user.tag} à le droit à la parole \nRaison : \`${reason}\` \nModérateur : \`${message.user.tag}\` \nPS: Ne flop plus si tu veux pas être mute à nouveau ^^`)
        .setTimestamp()
        .setFooter({ iconURL:"https://i.imgur.com/L94flCQ.jpeg", text:"SaikoBot © 2023", })

        await message.reply({embeds: [Embed]})

        await member.timeout(null, reason)
    }
}
