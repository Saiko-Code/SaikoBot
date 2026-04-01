const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { profileImage } = require('discord-arts');

module.exports = {
    name: "user-info",
    description: "Affiche les informations d'un utilisateur",
    permission: "Aucune",
    dm: true,
    category: "Informations",
    options: [
        {
            type: 'user', // Type 6 = Utilisateur
            name: "membre",
            description: "L'utilisateur dont vous voulez voir les informations",
            required: true
        }
    ],

    async run(client, interaction) {
        try {
            await interaction.deferReply(); // Retarde la réponse pour éviter le timeout

            // Récupération des informations
            const user = interaction.options.getUser('membre');
            if (!user) {
                return interaction.editReply("Utilisateur introuvable.");
            }

            const member = await interaction.guild.members.fetch(user.id).catch(() => null);
            const username = user.username;
            const avatar = user.displayAvatarURL();
            const joined = member?.joinedAt
                ? `<t:${Math.floor(member.joinedAt.getTime() / 1000)}:R>`
                : "Non disponible";
            const created = `<t:${Math.floor(user.createdAt.getTime() / 1000)}:R>`;
            const roles = member
                ? member.roles.cache.map(r => r).join("\n") || "Aucun rôle attribué"
                : "Non disponible";

            // Génération de l'image de profil
            const profileBuffer = await profileImage(user.id, {
                badgesFrame: true,
                moreBackgroundBlur: true,
                backgroundBrightness: 100,
            });

            const imageAttachment = new AttachmentBuilder(profileBuffer, { name: 'profile.png' });

            // Création de l'embed
            const embed = new EmbedBuilder()
                .addFields({ name: `Nom d'utilisateur:`, value: `${username}` })
                .addFields({ name: `🧾 • Compte créé le :`, value: `${created}`, inline: true })
                .addFields({ name: `🧾 • Rejoint ce serveur :`, value: `${joined}`, inline: true })
                .addFields({ name: `📚 • Rôles :`, value: roles, inline: false })
                .setAuthor({ iconURL: avatar, name: `User ID: ${user.id}` })
                .setTimestamp()
                .setColor('Purple')
                .setImage("attachment://profile.png");

            // Envoi de la réponse
            await interaction.editReply({ embeds: [embed], files: [imageAttachment] });
        } catch (error) {
            console.error(error);
            interaction.editReply("Une erreur s'est produite lors de l'exécution de la commande.");
        }
    }
};
