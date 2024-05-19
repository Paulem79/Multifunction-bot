import { ActionRowBuilder, AnySelectMenuInteraction, ApplicationCommandOptionType, CacheType, ChatInputCommandInteraction, EmbedBuilder, Locale, SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from 'discord.js';

import { client } from '../index.js';
import { Command, HelpTypes } from '../handlers/commands.js';
import { LocaleType, getForLocale, getGlobalMessageByLang, getMessageByLang } from '../utils/langfinder.js';
import { commands } from '../events/onStart.js';

export default {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Get " + client.user.username + "'s commands")
        .setNameLocalizations({
            fr: 'aide',
        })
        .setDescriptionLocalizations({
            fr: 'Connaître les commandes de ' + client.user.username
        }),

    async execute(interaction, locales) {
        const embed = new EmbedBuilder()
        .setTitle(getMessageByLang(locales, LocaleType.ALL_COMMANDS, interaction))
        .setColor("Blurple")
        .setDescription(getMessageByLang(locales, LocaleType.NAVIGATE, interaction));
    
        await interaction.reply({ embeds: [embed], components: [getSelectMenu(interaction)] });
    },

    async selectmenu(interaction, locales) {
        if(interaction.user.id != interaction.message.interaction.user.id) return await interaction.reply({ content: getGlobalMessageByLang(LocaleType.UNAUTHORIZED, interaction), ephemeral: true });
        if(interaction.customId != "help") return;
        let commandsList = interaction.client.application.commands.cache.map(cmd => commands.find(c => c.data.name == cmd.name));
    
        const embed = new EmbedBuilder()
        .setTitle(interaction.values[0])
        .setColor("Blurple");
    
        if(HelpTypes.Delete.locales.locales.some(l => l.message == interaction.values[0])) return await interaction.message.delete();
        else {
            const filtered = commandsList.filter(cmd => cmd.attributes.type != undefined && cmd.attributes.type.locales.locales.some(l => l.message == interaction.values[0]));
            
            for(let field of filtered){
                let options = "";

                for(let option of field.data.options){

                    if(option.toJSON().type == ApplicationCommandOptionType.Subcommand) {

                        options += `${option.toJSON().name}`;
                        if(field.data.options.filter(opt => opt.toJSON().type == ApplicationCommandOptionType.Subcommand).indexOf(option) != field.data.options.length-1)
                        options += "|";

                        continue;
                    }

                    if(field.data.options.indexOf(option) != 0) options += " ";

                    if(option.toJSON().required) options += "<";
                    else options += "[";

                    options += option.toJSON().name;

                    if(option.toJSON().required) options += ">";
                    else options += "]";
                }
                
                embed.addFields({
                    name: `/${getForLocale(field.data.name_localizations, field.data.name, interaction.locale)} ${options}`,
                    value: getForLocale(field.data.description_localizations, field.data.description, interaction.locale)
                });
            }
            
            await interaction.update({ embeds: [embed], components: [getSelectMenu(interaction)] });
        }
    },

    locales: [
        {
            caseofuse: LocaleType.ALL_COMMANDS,
            locales: [
                {
                    lang: "default",
                    message: "All commands"
                },
                {
                    lang: Locale.French,
                    message: "Toutes les commandes"
                }
            ]
        },
        {
            caseofuse: LocaleType.NAVIGATE,
            locales: [
                {
                    lang: "default",
                    message: "Use the select menu below to see all commands of " + client.user.username
                },
                {
                    lang: Locale.French,
                    message: "Utilisez la navigation pour voir toutes les commandes de " + client.user.username
                }
            ]
        },
    ],

    attributes: {
        cooldown: 5,
        type: HelpTypes.Utility
    },
} as Command;

function getSelectMenu(interaction: ChatInputCommandInteraction<CacheType> | AnySelectMenuInteraction<CacheType>){
  let enums: Array<StringSelectMenuOptionBuilder> = [];

  for(let i = 0; i < HelpTypes.Alls.length; i++){
    if(HelpTypes.Alls[i] == HelpTypes.Delete && interaction.ephemeral) continue;
    // Cache the found translation of the select menu option, check if it isn't already in enums and if it's the good locale, else, it returns the default translation
    const cacheFoundTranslation = (HelpTypes.Alls[i].locales.locales.find(l => l.lang == interaction.locale
        && !enums.some(e => e.data.label == l.message || e.data.value == l.message))
        ?? HelpTypes.Alls[i].locales.locales.find(l => l.lang == "default"
            && !enums.some(e => e.data.label == l.message || e.data.value == l.message))).message;
    enums.push(new StringSelectMenuOptionBuilder()
    .setLabel(cacheFoundTranslation)
    .setValue(cacheFoundTranslation));
  }

  const select = new StringSelectMenuBuilder()
    .setCustomId('help')
    .setPlaceholder('Choisissez une catégorie...')
    .addOptions(
      enums
    );

  const row = new ActionRowBuilder<StringSelectMenuBuilder>()
    .addComponents(select);

  return row;
}