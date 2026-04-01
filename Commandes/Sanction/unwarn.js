const { PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: "unwarn",
    description: "Permet de supprimer un avertissement d'un membre",
    dm: false,
    category: "Sanction",
    permission: PermissionFlagsBits.ManageMessages,
    options: [
        {
            type: "user",
            name: "membre",
            description: "Le membre dont vous souhaitez supprimer un avertissement",
            required: true,
            autocomplete: true
        },
        {
            type: "string",
            name: "id",
            description: "ID du warn que vous voulez supprimer",
            required: true,
            autocomplete: false
        }
    ],

    async run(bot, interaction, args) {
        try {
            let user = await bot.users.fetch(interaction.options.get('membre').value);
            if (!user) return interaction.reply({ content: "Membre introuvable.", ephemeral: true });

            let member = interaction.guild.members.cache.get(user.id);
            if (!member) return interaction.reply({ content: "Ce membre n'est pas sur le serveur.", ephemeral: true });

            let id = args.get('id').value;

            // Vérifications des permissions et hiérarchies
            if (interaction.user.id === user.id) 
                return interaction.reply({ content: "Vous ne pouvez pas supprimer vos propres avertissements.", ephemeral: true });

            if ((await interaction.guild.fetchOwner()).id === user.id) 
                return interaction.reply({ content: "Vous ne pouvez pas supprimer les avertissements du propriétaire du serveur.", ephemeral: true });

            if (interaction.member.roles.highest.comparePositionTo(member.roles.highest) <= 0) 
                return interaction.reply({ content: "Vous ne pouvez pas supprimer les avertissements de ce membre.", ephemeral: true });

            if ((await interaction.guild.members.fetchMe()).roles.highest.comparePositionTo(member.roles.highest) <= 0) 
                return interaction.reply({ content: "Je ne peux pas supprimer les avertissements de ce membre.", ephemeral: true });

            // Vérification de l'existence du warn
            bot.db.query(`SELECT * FROM warns WHERE guild = ? AND user = ? AND warn = ?`, 
            [interaction.guild.id, user.id, id], async (err, req) => {
                if (err) {
                    console.error(err);
                    return interaction.reply({ content: "Une erreur est survenue lors de la recherche de l'avertissement.", ephemeral: true });
                }

                if (req.length < 1) 
                    return interaction.reply({ content: "Aucun avertissement trouvé pour cet ID.", ephemeral: true });

                // Suppression du warn
                bot.db.query(`DELETE FROM warns WHERE guild = ? AND user = ? AND warn = ?`, 
                [interaction.guild.id, user.id, id], (err) => {
                    if (err) {
                        console.error(err);
                        return interaction.reply({ content: "Une erreur est survenue lors de la suppression de l'avertissement.", ephemeral: true });
                    }

                    return interaction.reply({ content: `✅ L'avertissement avec l'ID \`${id}\` de **${user.tag}** a été supprimé avec succès !`, ephemeral: true });
                });
            });

        } catch (error) {
            console.error(error);
            return interaction.reply({ content: "Une erreur inattendue est survenue.", ephemeral: true });
        }
    }
};
