const { AttachmentBuilder } = require('discord.js');
const { profileImage } = require('discord-arts');

module.exports = async (bot, member) => {
    bot.db.query(
        `SELECT goodbye_channel_id FROM welcome_goodbye WHERE guild_id = ?`, 
        [member.guild.id], 
        async (err, result) => {
            if (err) {
                console.error('Erreur lors de la récupération du canal d\'au revoir :', err);
                return;
            }

            if (!result || result.length < 1 || !result[0].goodbye_channel_id) {
                console.log('Aucun canal d\'au revoir trouvé dans la base de données.');
                return;
            }

            const channel = member.guild.channels.cache.get(result[0].goodbye_channel_id);
            if (!channel) {
                console.error('Canal d\'au revoir introuvable ou permissions insuffisantes.');
                return;
            }

            console.log(`Canal d'au revoir trouvé : ${channel.name}`);

            try {
                // Nombre total de membres restants après le départ
                const totalMembers = member.guild.memberCount;

                // Génération de l'image d'au revoir
                const buffer = await profileImage(member.id, {
                    username: member.user.username,
                    discriminator: member.user.discriminator,
                    guildName: member.guild.name,
                    avatar: member.user.displayAvatarURL({ extension: 'png', forceStatic: true }),
                    background: 'https://imgur.com/m4hUnwj', // Image de fond personnalisable
                    theme: 'dark',
                    customTag: `Nous sommes désormais ${totalMembers}... 😢` // Indique le nombre de membres restants
                });

                // Création de l'attachement
                const attachment = new AttachmentBuilder(buffer, { name: 'goodbye.png' });

                // Envoi du message avec l'image
                await channel.send({
                    content: `😢 <@${member.id}> a quitté le serveur.\nNous sommes maintenant **${totalMembers} membres**.`,
                    files: [attachment]
                });

                console.log(`Message d'au revoir envoyé dans ${channel.name}`);
            } catch (error) {
                console.error('Erreur lors de la création ou de l\'envoi de l\'image d\'au revoir :', error);
            }
        }
    );
};
