const Discord = require("discord.js");

module.exports = {
    name: "setstatus",
    description: "Change le statut du bot",
    permissions: Discord.PermissionFlagsBits.Administrator,
    dm: false,
    category: "Administration",

    options: [
        {
            type: "string",
            name: "activité",
            description: "Type d'activité",
            required: true,
            autocomplete: true,
        },
        {
            type: "string",
            name: "status",
            description: "Texte du statut",
            required: true,
            autocomplete: false,
        },
        {
            type: "string",
            name: "lien",
            description: "URL Twitch (si streaming)",
            required: false,
            autocomplete: false,
        }
    ],

    async run(bot, interaction) {

        const activity = interaction.options.getString("activité");
        const status = interaction.options.getString("status");
        const link = interaction.options.getString("lien");

        const validActivities = ["Listening", "Playing", "Competing", "Watching", "Streaming"];

        if (!validActivities.includes(activity)) {
            return interaction.reply({
                content: "Merci d'utiliser l'autocomplete.",
                ephemeral: true
            });
        }

        if (!status) {
            return interaction.reply({
                content: "Merci d'ajouter un texte de statut.",
                ephemeral: true
            });
        }

        // Vérification du streaming
        if (activity === "Streaming") {
            if (!link) {
                return interaction.reply({
                    content: "Tu dois fournir un lien Twitch.",
                    ephemeral: true
                });
            }

            // Vérification du lien twitch
            const regex = /^(?:https?:\/\/)?(?:www\.|go\.)?twitch\.tv\/([a-z0-9_]+)($|\?)/i;

            if (!regex.test(link)) {
                return interaction.reply({
                    content: "Le lien Twitch fourni n'est pas valide.",
                    ephemeral: true
                });
            }

            await bot.user.setPresence({
                activities: [{
                    name: status,
                    type: Discord.ActivityType.Streaming,
                    url: link
                }],
                status: "online"
            });

        } else {

            await bot.user.setPresence({
                activities: [{
                    name: status,
                    type: Discord.ActivityType[activity]
                }],
                status: "online"
            });
        }

        return interaction.reply({
            content: "Statut mis à jour avec succès.",
            ephemeral: true
        });
    }
};
