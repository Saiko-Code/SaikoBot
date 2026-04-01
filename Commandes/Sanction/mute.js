const Discord = require("discord.js")
const ms = require("ms")

module.exports = {

    name: "mute",
    description: "Te mute quand tu fait un flop ou quand t'es trop relou 🤏",
    permission : Discord.PermissionFlagsBits.ModerateMembers,
    dm : false,
    category: "Modération",
    options : [
        {
            type: "user",
            name: "membre",
            description: "le membre à mettre au coin",
            autocomplete: false,
            required: true
        }, {
            type:"string",
            name:"temps",
            description:"Le temps de ratio ",
            autocomplete: false,
            required: true
        }, {
            type: "string",
            name: "raison",
            description: "La raison du ratio",
            autocomplete: false,
            required: true
        }
    ],

    async run(bot, message, args) {

        let user = args.getUser("membre")
        if(!user) return message.reply("Pas de membre !")
        let member = message.guild.members.cache.get(user.id)
        if(!member) return message.reply("Pas de membre !")

        let time = args.getString("temps")
        if(!time) return message.reply("Pas de temps !")
        if(isNaN(ms(time))) return message.reply("Pas le bon format !")
        if(ms(time) > 2419200000) return message.reply("Le mute ne peut pas durer plus de 28 jours !")

        let reason = args.getString("raison")
        if(!reason) reason = "Pas de raison fournie.";

        if(message.user.id === user.id) return message.reply("Ne te mute pas tout seul !")
        if((await message.guild.fetchOwner()).id === user.id) return message.reply("Ne mute pas le chef du serveur !")
        if(!member.moderatable) return message.reply("Je ne peux pas mute ce membre !")
        if(message.member.roles.highest.comparePositionTo(member.roles.highest) <= 0) return message.reply("Tu ne peux pas mute cette personne !")
        if(member.isCommunicationDisabled()) return message.reply("Ce membre est déjà mute !")

        try {await user.send(`Tu as été mis au coin sur ${message.guild.name} par ${message.user.tag} pendant ${time} pour la raison : \`${reason}\` \nPS: T'as flop mon grand !`)} catch(err) {}

        let Embed = new Discord.EmbedBuilder()
        .setColor(bot.color)
        .setTitle("Un membre à été mis au coin !")
        .setThumbnail(bot.user.displayAvatarURL({dynamic: true}))
        .setDescription(`${user.tag} a été mis au coin. \nRaison : \`${reason}\` \nTemps : \`${time}\` \nModérateur : \`${message.user.tag}\` \nPs: T'as flop mon grand !`)
        .setTimestamp()
        .setFooter({ iconURL:"https://i.imgur.com/L94flCQ.jpeg", text:"SaikoBot © 2023", })

        await message.reply({embeds: [Embed]})

        await member.timeout(ms(time), reason)
    }
}
