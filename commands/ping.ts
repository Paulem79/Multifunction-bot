import { Locale, SlashCommandBuilder } from "discord.js";
import { Command, HelpTypes } from "../handlers/commands.js";
import { LocaleType } from "../utils/langfinder.js";

export default new Command({
    data: new SlashCommandBuilder()
    .setName("latency")
    .setNameLocalizations({
        fr: "latence"
    })
    .setDescription("Get the bot's latency.")
    .setDescriptionLocalizations({
        fr: "Obtenir la latence du bot."
    }),

    async execute(interaction) {
        await interaction.reply({
            content: this.getMessageByLang(LocaleType.LATENCY_REPLY)
                .replace("%p", ((Date.now() - interaction.createdTimestamp)*2).toString()),
            ephemeral: true
        });
    },

    locales: [
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

    attributes: {
        type: HelpTypes.Utility
    }
});
