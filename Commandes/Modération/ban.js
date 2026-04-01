const Discord = require("discord.js")

module.exports = {

    name: "ban",
    description: "Bannir un membre ❌",
    permission: Discord.PermissionFlagsBits.BanMembers,
    dm: false,
    category: "Modération",
    options: [
        {
            type: "user",
            name: "membre",
            description: "Le membre à bannir",
            autocomplete: false,
            required: true
        }, {
            type: "string",
            name: "raison",
            description: "La raison du banissement",
            autocomplete: false,
            required: true
        }
    ],

    async run(bot, message, args) {

        try {

            let user = await bot.users.fetch(args._hoistedOptions[0].value)
            if(!user) return message.reply("Pas de membre à bannir !")
            let member = message.guild.members.cache.get(user.id)
            
            let reason = args.getString("raison")
            if(!reason) reason = "Pas de raison fournie.";

            if(message.user.id === user.id) return message.reply("N'essaie pas de te bannir !")
            if((await message.guild.fetchOwner()).id === user.id) return message.reply("Ne ban pas le chef du serveur !")
            if(member && !member.bannable) return message.reply("Je ne peux pas bannir ce membre !")
            if(member && message.member.roles.highest.comparePositionTo(member.roles.highest) <= 0) return message.reply("Tu ne peux pas bannir cette personne !")
           if((await message.guild.bans.fetch()).get(user.id)) return message.reply("Ce membre est déjà banni !")

           try {await user.send(`Tu as été banni du serveur ${message.guild.name} par ${message.user.tag} pour la raison : \`${reason}\` \nPS: C'est ciao tu dégage chouine + ratio !`)} catch(err) {}
           
           let Embed = new Discord.EmbedBuilder()
            .setColor(bot.color)
            .setTitle("Un membre à été banni !")
            .setThumbnail(bot.user.displayAvatarURL({dynamic: true}))
            .setDescription(`${user.tag} a été banni. \nRaison : \`${reason}\` \nModérateur : \`${message.user.tag}\` \nDescription : C'est ciao tu dégage chouine + ratio !`)
            .setTimestamp()
            .setFooter({ iconURL: bot.user.displayAvatarURL({dynamic: true}), text:"SaikoBot © 2023", })

            await message.reply({embeds: [Embed]})

            await message.guild.bans.create(user.id, {reason: reason})

        } catch (err) {
            
            return message.reply("Pas de membre à bannir !")
        }

    }
}