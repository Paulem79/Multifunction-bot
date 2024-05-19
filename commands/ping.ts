import { Locale, SlashCommandBuilder } from "discord.js";
import { Command, HelpTypes } from "../handlers/commands.js";
import { LocaleType } from "../utils/langfinder.js";

const command = new Command();

command.data = new SlashCommandBuilder()
    .setName("latency")
    .setNameLocalizations({
        fr: "latence"
    })
    .setDescription("Get the bot's latency.")
    .setDescriptionLocalizations({
        fr: "Obtenir la latence du bot."
    });

command.execute = async function(interaction) {
    await interaction.reply({
        content: command.getMessageByLang(LocaleType.LATENCY_REPLY)
            .replace("%p", ((Date.now() - interaction.createdTimestamp)*2).toString()),
        ephemeral: true
    });
}

command.locales = [
    {
        caseofuse: LocaleType.LATENCY_REPLY,
        locales: [
            {
                lang: "default",
                message: "🏓 Bot's latency is %pms !"
            },
            {
                lang: Locale.French,
                message: "🏓 La latence du bot est de %pms !"
            }
        ]
    }
],

command.attributes = {
    type: HelpTypes.Utility
}

export default command;