import { ChannelType, Locale, SlashCommandBuilder } from "discord.js";
import { Command, HelpTypes } from "../handlers/commands.js";
import { LocaleType } from "../utils/langfinder.js";

const command = new Command({
    data: new SlashCommandBuilder()
    .setName("clear")
    .setNameLocalizations({
        fr: "effacer"
    })
    .setDescription("Clear specified channel's amount of messages.")
    .setDescriptionLocalizations({
        fr: "Supprimer le nombre de messages spécifié dans le salon spécifié."
    })
    .addChannelOption(option =>
        option.setName("channel")
        .setNameLocalizations({
            fr: "salon"
        })
        .setDescription("The selected channel")
        .setDescriptionLocalizations({
            fr: "Le salon spécifié"
        })
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildVoice)
        .setRequired(true)
    )
    .addIntegerOption(option =>
        option.setName("amount")
        .setNameLocalizations({
            fr: "quantité"
        })
        .setDescription("The amount of message to delete")
        .setDescriptionLocalizations({
            fr: "La quantité de message à supprimer"
        })
        .setMinValue(1)
        .setMaxValue(100)
        .setRequired(true)
    ),

    async execute(interaction) {
        const channel = interaction.options.getChannel("channel");
        const amount = interaction.options.getInteger("amount");
        
        if(!channel.isTextBased() && !channel.isVoiceBased()) return;

        channel.bulkDelete(amount, true)
            .then(async(messages) => {
                await interaction.reply({ content: command.getMessageByLang(LocaleType.CLEAR)
                    .replace("%a", messages.size.toString())
                    .replace("%c", channel.url), ephemeral: true });
            })
            .catch(console.error);
    },

    locales: [
        {
            caseofuse: LocaleType.CLEAR,
            locales: [
                {
                    lang: "default",
                    message: "%a messages have been removed of %c !"
                },
                {
                    lang: Locale.French,
                    message: "%a messages ont été supprimés de %c !"
                }
            ]
        }
    ],

    attributes: {
        type: HelpTypes.Utility
    }
});

export default command;