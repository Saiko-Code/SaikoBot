const Discord = require("discord.js");
const ms = require("ms");

module.exports = {
    name: "mute",
    description: "Mute un membre pour une durée définie.",
    permission: Discord.PermissionFlagsBits.ModerateMembers,
    dm: false,
    category: "Modération",

    options: [
        {
            type: Discord.ApplicationCommandOptionType.User,
            name: "membre",
            description: "Le membre à mute",
            required: true
        },
        {
            type: Discord.ApplicationCommandOptionType.String,
            name: "temps",
            description: "Durée du mute (ex: 10m, 1h, 1d)",
            required: true
        },
        {
            type: Discord.ApplicationCommandOptionType.String,
            name: "raison",
            description: "Raison du mute",
            required: false
        }
    ],

    async run(bot, interaction) {

        const user = interaction.options.getUser("membre");
        const member = interaction.guild.members.cache.get(user.id);

        if (!user) {
            return interaction.reply({ content: "Aucun membre trouvé.", ephemeral: true });
        }

        if (!member) {
            return interaction.reply({ content: "Ce membre n'est pas sur le serveur.", ephemeral: true });
        }

        const time = interaction.options.getString("temps");
        if (!time) return interaction.reply({ content: "Merci d'indiquer un temps.", ephemeral: true });
        if (isNaN(ms(time))) return interaction.reply({ content: "Format de temps invalide.", ephemeral: true });
        if (ms(time) > 2419200000) {
            return interaction.reply({
                content: "Le mute ne peut pas dépasser 28 jours.",
                ephemeral: true
            });
        }

        let reason = interaction.options.getString("raison") || "Aucune raison fournie.";

        // Vérifications hiérarchiques
        if (interaction.user.id === user.id)
            return interaction.reply({ content: "Tu ne peux pas te mute toi-même.", ephemeral: true });

        if ((await interaction.guild.fetchOwner()).id === user.id)
            return interaction.reply({ content: "Tu ne peux pas mute le propriétaire du serveur.", ephemeral: true });

        if (!member.moderatable)
            return interaction.reply({ content: "Je ne peux pas mute ce membre.", ephemeral: true });

        if (interaction.member.roles.highest.comparePositionTo(member.roles.highest) <= 0)
            return interaction.reply({ content: "Tu ne peux pas mute un membre avec un rôle supérieur ou égal au tien.", ephemeral: true });

        if (member.isCommunicationDisabled())
            return interaction.reply({ content: "Ce membre est déjà mute.", ephemeral: true });

        // Tentative d'envoi de MP
        try {
            await user.send(`Tu as été mute sur **${interaction.guild.name}** par **${interaction.user.tag}** pendant **${time}**.\nRaison : \`${reason}\`\nPS : t'as flop mon grand !`);
        } catch {}

        // Embed de confirmation
        const embed = new Discord.EmbedBuilder()
            .setColor(bot.color)
            .setTitle("Un membre a été mute")
            .setThumbnail(bot.user.displayAvatarURL({ dynamic: true }))
            .setDescription(
                `**${user.tag}** a été mute.\n\n` +
                `**Raison :** \`${reason}\`\n` +
                `**Durée :** \`${time}\`\n` +
                `**Modérateur :** \`${interaction.user.tag}\``
            )
            .setTimestamp()
            .setFooter({
                iconURL: bot.user.displayAvatarURL({ dynamic: true }),
                text: "SaikoBot © 2023",
            });

        await interaction.reply({ embeds: [embed] });

        // Exécution du mute
        await member.timeout(ms(time), reason);
    }
};
