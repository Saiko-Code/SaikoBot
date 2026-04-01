const Discord = require("discord.js")

module.exports = async(bot, guild, message,) => {

    let db = bot.db;
    
    if(messageLink.author.bot || messageLink.channel.type === Discord.ChannelType.DM) return;

    db.query(`SELECT * FROM server WHERE guild = '${message.guild.id}'`, async (err, req) => {

        if(req.length < 1) {

            db.query(`INSERT INTO server (guild, captcha) VALUES (${message.guild.id}, 'false')`)
        }
    })
}