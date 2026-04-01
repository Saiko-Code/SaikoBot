const Discord = require("discord.js")

module.exports = {

    name: "ping",
    description: "Te met un giga ratio 😖",
    permission : "Aucune",
    dm : true,
    category : "Informations",

    async run(bot, message, args) {

        await message.reply(`Pong, allez bouffe se ratio 😹`)
    }
}
