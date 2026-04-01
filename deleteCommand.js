const { REST } = require('@discordjs/rest');
const { Routes } = require('discord.js');
require("dotenv").config();

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log("🔍 Récupération des commandes enregistrées...");

        // Récupérer les commandes globales
        const globalCommands = await rest.get(Routes.applicationCommands(process.env.BOT_ID));
        if (globalCommands.length > 0) {
            console.log(`🗑 Suppression de ${globalCommands.length} commandes globales...`);
            await rest.put(Routes.applicationCommands(process.env.BOT_ID), { body: [] });
            console.log("✅ Toutes les commandes globales ont été supprimées !");
        } else {
            console.log("✅ Aucune commande globale trouvée.");
        }

        // Récupérer les commandes spécifiques aux guildes
        if (!process.env.GUILD_ID) {
            console.warn("⚠️  GUILD_ID non défini, impossible de supprimer les commandes guild !");
        } else {
            const guildCommands = await rest.get(Routes.applicationGuildCommands(process.env.BOT_ID, process.env.GUILD_ID));
            if (guildCommands.length > 0) {
                console.log(`🗑 Suppression de ${guildCommands.length} commandes de la guilde...`);
                await rest.put(Routes.applicationGuildCommands(process.env.BOT_ID, process.env.GUILD_ID), { body: [] });
                console.log("✅ Toutes les commandes de la guilde ont été supprimées !");
            } else {
                console.log("✅ Aucune commande de guilde trouvée.");
            }
        }

    } catch (error) {
        console.error("❌ Erreur lors de la suppression des commandes :", error);
    }
})();
