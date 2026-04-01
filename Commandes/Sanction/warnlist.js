const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    name: "warn-list",
    description: "Affiche le ou les avertissements d'un membre 🪪",
    permission: PermissionFlagsBits.ManageMessages,
    dm: false,
    category: "Informations",
    options: [
        {
            type: "user", // Type USER
            name: "membre",
            description: "Information des sanctions du membre",
            required: true
        }
    ],

    async run(bot, interaction) {
        try {
            const user = interaction.options.getUser("membre");
            if (!user) return interaction.reply({ content: "Pas de membre sélectionné.", ephemeral: true });

            const member = interaction.guild.members.cache.get(user.id);
            if (!member) return interaction.reply({ content: "Ce membre n'est pas sur le serveur !", ephemeral: true });

            // Requête SQL pour récupérer les avertissements
            bot.db.query(`SELECT * FROM warns WHERE guild = ? AND user = ?`, [interaction.guildId, user.id], async (err, req) => {
                if (err) {
                    console.error(err);
                    return interaction.reply({ content: "❌ Une erreur est survenue lors de la récupération des sanctions.", ephemeral: true });
                }

                if (req.length < 1) return interaction.reply({ content: "Ce membre n'a pas de sanctions !", ephemeral: true });

                // Trier les sanctions par date
                req.sort((a, b) => parseInt(b.date) - parseInt(a.date));

                // Création de l'embed principal
                let embed = new EmbedBuilder()
                    .setColor(bot.color)
                    .setDescription(`Les sanctions de **${user.tag}** LOSEEEEER !`)
                    .setThumbnail(user.displayAvatarURL({ dynamic: true }))
                    .setTimestamp()
                    .setFooter({ iconURL: "https://i.imgur.com/L94flCQ.jpeg", text: "SaikoBot © 2023" });

                let actionRows = [];
                let currentRow = new ActionRowBuilder();
                
                // Ajout des sanctions et boutons
                for (let i = 0; i < req.length; i++) {
                    embed.addFields([
                        {
                            name: `Sanction n°${i + 1}`,
                            value: `> **Auteur** : ${(await bot.users.fetch(req[i].author)).tag}\n> **ID** : \`${req[i].warn}\`\n> **Raison** : \`${req[i].reason}\`\n> **Date** : <t:${Math.floor(parseInt(req[i].date) / 1000)}:F>`
                        }
                    ]);

                    let button = new ButtonBuilder()
                        .setCustomId(`unwarn_${req[i].warn}`)
                        .setLabel(`Supprimer Warn #${i + 1}`)
                        .setStyle(ButtonStyle.Danger);

                    // Limite de 5 boutons par ligne
                    if (currentRow.components.length < 5) {
                        currentRow.addComponents(button);
                    } else {
                        actionRows.push(currentRow);
                        currentRow = new ActionRowBuilder().addComponents(button);
                    }
                }

                actionRows.push(currentRow);

                // Envoi de l'embed avec les boutons
                const reply = await interaction.reply({ embeds: [embed], components: actionRows, ephemeral: true });

                // Création du collector pour gérer les boutons
                const collector = reply.createMessageComponentCollector({ time: 60000 });

                collector.on("collect", async (buttonInteraction) => {
                    if (!buttonInteraction.customId.startsWith("unwarn_")) return;

                    // Vérification de l'utilisateur (évite qu'un autre modérateur supprime sans permission)
                    if (buttonInteraction.user.id !== interaction.user.id) {
                        return buttonInteraction.reply({ content: "❌ Vous ne pouvez pas interagir avec cette commande.", ephemeral: true });
                    }

                    const warnId = buttonInteraction.customId.split("_")[1];

                    // Suppression de l'avertissement dans la base de données
                    bot.db.query(`DELETE FROM warns WHERE guild = ? AND user = ? AND warn = ?`, [interaction.guildId, user.id, warnId], async (err) => {
                        if (err) {
                            console.error(err);
                            return buttonInteraction.reply({ content: "❌ Une erreur est survenue lors de la suppression de l'avertissement.", ephemeral: true });
                        }

                        await buttonInteraction.reply({ content: `✅ L'avertissement avec l'ID \`${warnId}\` de **${user.tag}** a été supprimé avec succès !`, ephemeral: true });

                        // Mise à jour de l'affichage en supprimant le bouton
                        let updatedComponents = [];
                        actionRows.forEach(row => {
                            let newRow = new ActionRowBuilder();
                            row.components.forEach(button => {
                                if (button.customId !== `unwarn_${warnId}`) {
                                    newRow.addComponents(button);
                                }
                            });
                            if (newRow.components.length > 0) updatedComponents.push(newRow);
                        });

                        // Modifier le message pour retirer le bouton
                        await interaction.editReply({ components: updatedComponents });
                    });
                });

                collector.on("end", async () => {
                    // Désactiver tous les boutons après expiration du temps
                    let disabledComponents = actionRows.map(row => {
                        let newRow = new ActionRowBuilder();
                        row.components.forEach(button => {
                            newRow.addComponents(button.setDisabled(true));
                        });
                        return newRow;
                    });

                    await interaction.editReply({ components: disabledComponents });
                });
            });

        } catch (error) {
            console.error(error);
            return interaction.reply({ content: "❌ Une erreur inattendue est survenue.", ephemeral: true });
        }
    }
};
