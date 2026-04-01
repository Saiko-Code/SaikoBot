//Cela permet de savoir quand le bot fonctionne
const Discord = require("discord.js")
const loadDatabase = require("../Loaders/loadDatabase")
const loadSlashCommands = require("../Loaders/loadSlashCommands")
const { ActivityType } = require('discord.js')

module.exports = async bot => {

    bot.user.setActivity({
        type: ActivityType.Custom,
        name: 'customstatus',
        state: '🌿 Update du Bot !'
    });

    bot.db = await loadDatabase()
    bot.db.connect(function () {

        //console.log("Base de données connectée !")
    })

    await loadSlashCommands(bot)

    console.log(`${bot.user.tag} part au charbon !`)
}
