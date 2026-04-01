const Discord = require("discord.js");

module.exports = {

    name: "setcaptcha",
    description: "Paramètre le captcha",
    permission: Discord.PermissionFlagsBits.ManageGuild,
    dm: false,
    category: "Sécurité 🔒",
    options: [
        {
            type: "string",
            name: "état",
            description: "Etat du captcha (on ou off)",
            autocomplete: true,
            required: true
        },
        {
            type: "channel",
            name: "salon",
            description: "Salon du captcha (renseigné si on)",
            autocomplete: false,
            required: false
        }
    ],

    async execute(interaction) {
        // Génération du captcha
        const captcha = new Captcha(); // Crée une instance
        captcha.async = false; // Désactive les processus asynchrones pour simplifier
        captcha.addDecoy(); // Ajoute des éléments de distraction au captcha
        captcha.drawTrace(); // Ajoute une ligne de trace au captcha
        captcha.drawCaptcha(); // Génère le texte du captcha

        // Enregistrez la réponse du captcha et l'utilisateur qui le demande
        const captchaText = captcha.text; // Texte du captcha
        const userId = interaction.user.id; // ID de l'utilisateur

        // Convertissez le captcha en une image jointe
        const attachment = new AttachmentBuilder(captcha.png, { name: 'captcha.png' });

        // Créez un embed pour l'envoyer à l'utilisateur
        const embed = new EmbedBuilder()
            .setTitle('Captcha de vérification')
            .setDescription(
                "Pour vérifier que vous n'êtes pas un bot, entrez le texte du captcha ci-dessous dans les 60 secondes."
            )
            .setImage('attachment://captcha.png')
            .setColor('Random');

        // Envoyer le captcha
        await interaction.reply({
            embeds: [embed],
            files: [attachment],
            ephemeral: true,
        });

        // Attendre une réponse de l'utilisateur
        const filter = (message) => message.author.id === userId; // Filtrer les messages de l'utilisateur uniquement
        const collector = interaction.channel.createMessageCollector({
            filter,
            time: 60000, // 60 secondes pour répondre
            max: 1, // Un seul message autorisé
        });

        collector.on('collect', async (message) => {
            if (message.content === captchaText) {
                // Bonne réponse
                await message.reply("✅ Captcha réussi ! Bienvenue !");
            } else {
                // Mauvaise réponse
                await message.reply("❌ Mauvaise réponse au captcha. Veuillez réessayer.");
            }
        });

        collector.on('end', (collected) => {
            if (collected.size === 0) {
                interaction.followUp("⏰ Temps écoulé. Vous n'avez pas répondu au captcha !");
            }
        });
    },
};