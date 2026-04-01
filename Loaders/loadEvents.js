const fs = require("fs");

module.exports = async bot => {
    // Lire tous les fichiers dans le dossier Events
    fs.readdirSync("./Events").filter(f => f.endsWith(".js")).forEach(file => {
        // Charger l'événement depuis le fichier
        const event = require(`../Events/${file}`);

        // Extraire le nom de l'événement sans l'extension .js
        const eventName = file.split(".js").join("");

        // Enregistrer l'événement avec bot.on() sans utiliser bind
        bot.on(eventName, (...args) => event(bot, ...args));

        console.log(`Événement 📁 | ${file} chargé avec succès !`);
    });
};
