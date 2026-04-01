const Discord = require("discord.js");

module.exports = {

    name: "help",
    description: "Te donne des infos sur les commandes 🤖",
    permission: "Aucune",
    dm: true,
    category: "Informations",

    options: [
        {
            type: "string", // IMPORTANT : string, pas ApplicationCommandOptionType
            name: "commande",
            description: "La commande à afficher",
            required: false,
            autocomplete: true
        }
    ],

    async run(bot, interaction) {

        const cmdName = interaction.options.getString("commande");
        const command = cmdName ? bot.commands.get(cmdName) : null;

        if (!command) {

            let categories = [];

            bot.commands.forEach(cmd => {
                if (!categories.includes(cmd.category)) categories.push(cmd.category);
            });

            const Embed = new Discord.EmbedBuilder()
                .setColor(bot.color)
                .setTitle("Liste des commandes")
                .setThumbnail(bot.user.displayAvatarURL({ dynamic: true }))
                .setDescription(
                    `Commandes disponibles : \`${bot.commands.size}\`\n` +
                    `Catégories : \`${categories.length}\``
                )
                .setTimestamp();

            categories.sort().forEach(cat => {
                let cmds = bot.commands.filter(cmd => cmd.category === cat);
                Embed.addFields({
                    name: `${cat}`,
                    value: cmds.map(cmd => `\`${cmd.name}\` — ${cmd.description}`).join("\n")
                });
            });

            return interaction.reply({ embeds: [Embed] });
        }

        const perm =
            typeof command.permission !== "bigint"
                ? command.permission
                : new Discord.PermissionsBitField(command.permission).toArray(false);

        const Embed = new Discord.EmbedBuilder()
            .setColor(bot.color)
            .setTitle(`Commande : ${command.name}`)
            .setThumbnail(bot.user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: "Nom", value: `\`${command.name}\`` },
                { name: "Description", value: `${command.description}` },
                { name: "Permission requise", value: `\`${perm}\`` },
                { name: "Disponible en DM", value: `\`${command.dm ? "Oui" : "Non"}\`` },
                { name: "Catégorie", value: `\`${command.category}\`` }
            )
            .setTimestamp();

        return interaction.reply({ embeds: [Embed] });
    }
};
