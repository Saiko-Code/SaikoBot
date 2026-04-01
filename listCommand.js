const { REST } = require("@discordjs/rest");
const { Routes } = require("discord.js");
require("dotenv").config();

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log("🔍 Vérification des commandes Discord...");

        const globalCommands = await rest.get(Routes.applicationCommands(process.env.BOT_ID));
        console.log(`🌍 Commandes globales : ${globalCommands.length}`);
        globalCommands.forEach(cmd => console.log(`- ${cmd.name} (ID: ${cmd.id})`));

        if (process.env.GUILD_ID) {
            const guildCommands = await rest.get(Routes.applicationGuildCommands(process.env.BOT_ID, process.env.GUILD_ID));
            console.log(`🏠 Commandes dans la guilde ${process.env.GUILD_ID} : ${guildCommands.length}`);
            guildCommands.forEach(cmd => console.log(`- ${cmd.name} (ID: ${cmd.id})`));
        }

    } catch (error) {
        console.error("❌ Erreur lors de la récupération des commandes :", error);
    }
})();
