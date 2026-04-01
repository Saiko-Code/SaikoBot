require("dotenv").config();

//Je déclare discord.js et les client
const Discord = require("discord.js");

//Filtre les informations que recevera le bot 
const intents = new Discord.IntentsBitField(3276799)
const bot = new Discord.Client({intents})
const LoadCommands = require ("./Loaders/loadCommands")
const LoadEvents = require ("./Loaders/loadEvents")

//Déclaration des donnés des commandes
bot.commands = new Discord.Collection()

//Chargement du filtre a fichier
LoadCommands(bot)
LoadEvents(bot)

//Déclartion de mon createID et base de donnée
bot.function = {
    createId: require("./Fonctions/createId"),

}

// Connexion du bot
bot.login(process.env.TOKEN);

// Événement prêt
bot.once("ready", async () => {
    console.log(`Bot connecté en tant que ${bot.user.tag}`);
    console.log(`Bot ID : ${bot.user.id}`);
    console.log(`Guild ID : ${process.env.GUILD_ID}`);

    
});

//Couleur de base du bot
bot.color = "#6568D4";
