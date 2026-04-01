const Discord = require("discord.js");

module.exports = {

    name: "warn",
    description: "Sanctionne un membre 😈",
    permission: Discord.PermissionFlagsBits.ManageMessages,
    dm: false,
    category: "Sanction",
    options: [
        {
            type: "user",
            name: "membre",
            description: "Le membre à reçu un avertissement",
            required: true,
            autocomplete: false
        }, {
            type: "string",
            name: "raison",
            description: "La raison de l'avertissement.",
            required: true,
            autocomplete: false
        }
    ],

    async run(bot, message, args, db) {

        let user = args.getUser("membre")
        if(!user) return message.reply("Pas de membre !")
        let member = message.guild.members.cache.get(user.id)
        if(!member) return message.reply("Pas de membre !")

        let reason = args.getString("raison")
        if(!reason) reason = "Pas de raison fournie.";

        if(message.user.id === user.id) return message.reply("N'essaie pas de te une sanction !")
        if((await message.guild.fetchOwner()).id === user.id) return message.reply("Ne met pas de sanction au chef du serveur !")
        if(message.member.roles.highest.comparePositionTo(member.roles.highest) <= 0) return message.reply("Tu ne peux pas sanctionner cette personne !")
        if((await message.guild.members.fetchMe()).roles.highest.comparePositionTo(member.roles.highest) <= 0) return message.reply(`${bot.user} ne peut pas sanctionner ce membre !`)

        try { await user.send(`${message.user.tag} vous à sanctionner sur le serveur ${message.guild.name} pour la raison : \`${reason}\``) } catch (err) {}

        await message.reply(`Vous avez sanctionner ${user.tag} pour la raison : \`${reason}\` avec succès !`)

        let ID = await bot.function.createId("WARN")

        bot.db.query(`INSERT INTO warns (guild, user, author, warn, reason, date) VALUES ('${message.guild.id}', '${user.id}', '${message.user.id}', '${ID}', '${reason.replace(/'/g, "\\'")}', '${Date.now()}')`)
    }
}