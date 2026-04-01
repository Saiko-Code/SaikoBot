const { AttachmentBuilder } = require('discord.js');
const { profileImage } = require('discord-arts');

module.exports = async (bot, member) => {
    bot.db.query(
        `SELECT welcome_channel_id FROM welcome_goodbye WHERE guild_id = ?`, 
        [member.guild.id], 
        async (err, result) => {
            if (err) {
                console.error('Erreur lors de la récupération du canal de bienvenue :', err);
                return;
            }

            if (!result || result.length < 1 || !result[0].welcome_channel_id) {
                console.log('Aucun canal de bienvenue trouvé dans la base de données.');
                return;
            }

            const channel = member.guild.channels.cache.get(result[0].welcome_channel_id);
            if (!channel) {
                console.error('Canal de bienvenue introuvable ou permissions insuffisantes.');
                return;
            }

            console.log(`Canal de bienvenue trouvé : ${channel.name}`);

            try {
                // Nombre total de membres sur le serveur
                const totalMembers = member.guild.memberCount;

                // Génération de l'image de bienvenue
                const buffer = await profileImage(member.id, {
                    username: member.user.username,
                    discriminator: member.user.discriminator,
                    guildName: member.guild.name,
                    avatar: member.user.displayAvatarURL({ extension: 'png', forceStatic: true }),
                    background: 'https://imgur.com/m4hUnwj', // Image de fond personnalisable
                    theme: 'dark',
                    customTag: `Membre #${totalMembers}` // Ajoute le nombre de membres sur l'image
                });

                // Création de l'attachement
                const attachment = new AttachmentBuilder(buffer, { name: 'welcome.png' });

                // Envoi du message avec l'image et le ping
                await channel.send({
                    content: `👋 Bienvenue <@${member.id}> sur le serveur ! 🎉\nTu es notre **${totalMembers}ᵉ membre** ! 🚀`,
                    files: [attachment]
                });

                console.log(`Message de bienvenue envoyé dans ${channel.name}`);
            } catch (error) {
                console.error('Erreur lors de la création ou de l\'envoi de l\'image de bienvenue :', error);
            }
        }
    );
};
