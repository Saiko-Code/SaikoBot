const Discord = require("discord.js");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord.js");

module.exports = async bot => {

    let commands = [];

    bot.commands.forEach(async command => {

        let slashcommand = new Discord.SlashCommandBuilder()
            .setName(command.name)
            .setDescription(command.description)
            .setDMPermission(command.dm);

        if (command.options?.length >= 1) {
            for (let opt of command.options) {

                const builderName =
                    "add" + opt.type.charAt(0).toUpperCase() + opt.type.slice(1) + "Option";

                slashcommand[builderName](option => {
                    option
                        .setName(opt.name)
                        .setDescription(opt.description)
                        .setRequired(opt.required ?? false);

                    // ✔ Autocomplete uniquement si STRING
                    if (opt.type === "string" && opt.autocomplete === true) {
                        option.setAutocomplete(true);
                    }

                    return option;
                });
            }
        }

        commands.push(slashcommand);
    });

    const rest = new REST({ version: "10" }).setToken(bot.token);

    await rest.put(Routes.applicationCommands(bot.user.id), { body: commands });
    console.log("Les slash commandes ont été créées avec succès !");
};
