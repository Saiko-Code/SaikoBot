const { REST } = require("@discordjs/rest");
const { Routes, SlashCommandBuilder } = require("discord.js");
const fs = require("fs");
require("dotenv").config();

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

async function deployCommands() {
    try {
        console.log("🔍 Chargement des commandes...");

        let commands = [];
        let commandNames = new Set(); // Utilisation d'un Set pour éviter les doublons

        const commandFolders = fs.readdirSync("./Commandes");

        for (const folder of commandFolders) {
            const commandFiles = fs.readdirSync(`./Commandes/${folder}`).filter(file => file.endsWith(".js"));

            for (const file of commandFiles) {
                const command = require(`./Commandes/${folder}/${file}`);
                if (!command.name || !command.description) continue;

                if (commandNames.has(command.name)) {
                    console.error(`❌ Duplication ignorée : la commande '${command.name}' existe déjà !`);
                    continue;
                }

                commandNames.add(command.name);

                let slashCommand = new SlashCommandBuilder()
                    .setName(command.name)
                    .setDescription(command.description);

                commands.push(slashCommand.toJSON());
                console.log(`✅ Commande chargée : /${command.name}`);
            }
        }

        console.log("🚀 Enregistrement des commandes sur Discord...");
        await rest.put(Routes.applicationCommands(process.env.BOT_ID), { body: commands });
        console.log("✅ Commandes enregistrées avec succès !");
    } catch (error) {
        console.error("❌ Erreur lors de l'enregistrement des commandes :", error);
    }
}

deployCommands();
