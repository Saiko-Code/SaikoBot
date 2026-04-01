const fs = require('fs');
const Discord = require('discord.js');

module.exports = async (bot) => {
  const commandFolders = fs.readdirSync('./Commandes', { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  for (const folder of commandFolders) {
    console.log(`Dossier 📁 | ${folder} chargé avec succès !`); // Afficher un message pour chaque dossier chargé

    const commandFiles = fs
      .readdirSync(`./Commandes/${folder}`)
      .filter((file) => file.endsWith('.js'));

    for (const file of commandFiles) {
      const command = require(`../Commandes/${folder}/${file}`);

      if (!command.name || typeof command.name !== 'string') {
        throw new TypeError(`La commande ${file.slice(0, file.length - 3)} n'a pas de name quoi !`);
      }

      bot.commands.set(command.name, command);
      console.log(`Commande 🤖 | ${file} chargée avec succès !`);
    }
  }
};
