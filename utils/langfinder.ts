import { CacheType, Locale, BaseInteraction } from 'discord.js';
import { Texts } from '../handlers/commands.js';

/**
 * Find the message locale from the global locales, with the case of use and the user locale (interaction)
 * @param caseofuse The case of use of the message, used to get him
 * @param interaction The user locale, faster to type with interaction.locale
 * @returns 
 */
export function getGlobalMessageByLang(caseofuse: LocaleType, interaction: BaseInteraction<CacheType>){
    return getGlobalByLang(caseofuse, interaction).message;
}

/**
 * Find the locale from the global locales, with the case of use and the user locale (interaction)
 * @param caseofuse The case of use of the message, used to get him
 * @param interaction The user locale, faster to type with interaction.locale
 * @returns 
 */
export function getGlobalByLang(caseofuse: LocaleType, interaction: BaseInteraction<CacheType>){
    return (
        globalLocales.find(l => l.caseofuse == caseofuse).locales.find(locale => locale.lang == interaction.locale) ??
        globalLocales.find(l => l.caseofuse == caseofuse).locales.find(locale => locale.lang == "default")
    );
}

export function findLangMessageInLocales(locales: Texts[], caseofuse: LocaleType, interaction: BaseInteraction<CacheType>) {
    if(locales != globalLocales && locales.find(l => l.caseofuse == caseofuse) == undefined) return getGlobalByLang(caseofuse, interaction);

    return (
        locales.find(l => l.caseofuse == caseofuse).locales.find(locale => locale.lang == interaction.locale) ??
        locales.find(l => l.caseofuse == caseofuse).locales.find(locale => locale.lang == "default")
    );
}

export function getForLocale<E extends number | string | symbol, K>(record: Partial<Record<E, K>>, whenerr: K, locale: E){
    try {
        return record[locale] ?? whenerr;
    } catch(err) {
        return whenerr;
    }
}

export enum LocaleType {
    // Global
    NONE,
    UNAUTHORIZED,
    ERROR,
    WAIT,

    // Ping
    LATENCY_REPLY,

    // Help
    NAVIGATE,
    ALL_COMMANDS,
    
    // Clear
    CLEAR,
}

export const globalLocales: Texts[] = [
    {
        caseofuse: LocaleType.UNAUTHORIZED,
        locales: [
            {
                lang: "default",
                message: "You can't do that!"
            },
            {
                lang: Locale.French,
                message: "Vous ne pouvez pas faire ceci !"
            }
        ]
    },
    {
        caseofuse: LocaleType.NONE,
        locales: [
            {
                lang: "default",
                message: "Hmm, you shouldn't be able to see that message!"
            },
            {
                lang: Locale.French,
                message: "Humm, tu n'étais pas censé voir ce message..."
            }
        ]
    },
    {
        caseofuse: LocaleType.ERROR,
        locales: [
            {
                lang: "default",
                message: "An error occured!"
            },
            {
                lang: Locale.French,
                message: "Une erreur est survenue !"
            }
        ]
    },
    {
        caseofuse: LocaleType.WAIT,
        locales: [
            {
                lang: "default",
                message: "Please wait %t to use \`/%c\`"
            },
            {
                lang: Locale.French,
                message: "Veuillez attendre <t:%t:R> pour réutiliser \`/%c\`"
            }
        ]
    }
]