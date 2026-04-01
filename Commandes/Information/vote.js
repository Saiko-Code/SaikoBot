const Discord = require("discord.js");

module.exports = {

    name: "vote",
    description: "Vote pour les soirrés cinoche",
    permission : "Aucune",
    dm : true,
    category : "Informations",

    async run(bot, message,) {

        const Embed = new Discord.EmbedBuilder()
        .setColor(bot.color)
        .setTitle("Disponibilité dans la semaine")
        .setThumbnail(bot.user.displayAvatarURL({dynamic: true}))
        .setDescription(`Voter pour le / les jours quand vous êtes dispo ou quand vous voulez regarder le film !\n\n:regional_indicator_l:  | Lundi\n\n:regional_indicator_m: | Mardi\n\n:regional_indicator_m: | Mercredi\n\n:regional_indicator_j: | Jeudi \n\n:regional_indicator_v: | Vendredi\n\n:regional_indicator_s: | Samedi\n\n:regional_indicator_d: | Dimanche\n\n**Pour l'heure on verra le jour même ^^**`)
        .setImage('https://media.giphy.com/media/EqjqXkrEb9XNEJam1A/giphy.gif')
        .setTimestamp()
        .setFooter({ iconURL:"https://i.imgur.com/L94flCQ.jpeg", text:"SaikoBot © 2023", })

        await message.reply({embeds: [Embed]}).then(async (msg) => {
            await msg.react(":white_check_mark:");
        })
    }

    
}
