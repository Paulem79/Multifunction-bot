import { AnySelectMenuInteraction, AutocompleteInteraction, ButtonInteraction, ChatInputCommandInteraction, Client, Locale, ModalSubmitInteraction, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder } from 'discord.js';
import path from "path";
import fs from "fs";
import { findLangMessageInLocales, getGlobalByLang, LocaleType } from '../utils/langfinder.js';

export class HelpTypes {
  public static Alls: HelpTypes[] = [];

  static readonly Utility = new HelpTypes({
    caseofuse: LocaleType.NONE,
    locales: [
      {
        lang: "default",
        message: "➕ Utilities"
      },
      {
        lang: Locale.French,
        message: "➕ Utilitaire"
      }
    ]
  });

  static readonly Delete = new HelpTypes({
    caseofuse: LocaleType.NONE,
    locales: [
      {
        lang: "default",
        message: "❌ Delete"
      },
      {
        lang: Locale.French,
        message: "❌ Supprimer"
      }
    ]
  });

  private constructor(public readonly locales: Texts) {
    HelpTypes.Alls.push(this);
  }
}

export interface Texts {
  locales: TextLocale[],
  caseofuse?: LocaleType;
}

export interface TextLocale {
  lang: Locale | "default";
  message: string;
}

export class Command {
  data: SlashCommandOptionsOnlyBuilder;
  interaction?: ChatInputCommandInteraction<"cached">;
  execute: (interaction: ChatInputCommandInteraction<"cached">) => any;
  autocomplete?: (interaction: AutocompleteInteraction<"cached">) => any;
  selectmenu?: (interaction: AnySelectMenuInteraction<"cached">) => any;
  modal?: (interaction: ModalSubmitInteraction<"cached">) => any;
  button?: (interaction: ButtonInteraction<"cached">) => any;
  locales?: Texts[];
  attributes?: Attributes;

  /**
   * Find the message locale from the slashcommand locales or the global locales, with the case of use and the user locale (interaction)
   * @param locales The slashcommand locales, can be null to directly use the global locales
   * @param caseofuse The case of use of the message, used to get him
   * @param interaction The user locale, faster to type with interaction.locale
   * @returns 
   */
  public getMessageByLang(caseofuse: LocaleType){
    return (
        findLangMessageInLocales(this.locales, caseofuse, this.interaction) ??
        getGlobalByLang(caseofuse, this.interaction)
    ).message;
  }

  constructor(options?: {
    data: SlashCommandOptionsOnlyBuilder,
    execute: (interaction: ChatInputCommandInteraction<"cached">) => any,
    autocomplete?: (interaction: AutocompleteInteraction<"cached">) => any,
    selectmenu?: (interaction: AnySelectMenuInteraction<"cached">) => any,
    modal?: (interaction: ModalSubmitInteraction<"cached">) => any,
    button?: (interaction: ButtonInteraction<"cached">) => any,
    locales?: Texts[],
    attributes?: Attributes
  }) {

    if(!options) return;
    this.data = options.data;
    this.execute = options.execute;
    this.autocomplete = options.autocomplete;
    this.selectmenu = options.selectmenu;
    this.modal = options.modal;
    this.button = options.button;
    this.locales = options.locales;
    this.attributes = options.attributes;
  }
}

export interface Attributes {
  cooldown?: number;
  type?: HelpTypes;
}

/**
 * Get the commands, register them
 * @param dir The directory
 * @param commandPath The path to the command directory (from the file where you use the function)
 * @param client used to register commands from the function
 * @returns The commands
 */
export async function getCommands(dir: string, commandPath: string, client: Client<true>){
  const cmd: Command[] = [];
  const foldersPath = path.join(dir, commandPath);
  const commandFilesIndividual = fs.readdirSync(foldersPath).filter(file => file.endsWith('.js'));
  const commandFolders = getDirectories(foldersPath);

  for (const folder of commandFolders) {
    // Grab all the command files from the commands directory you created earlier
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    await Register(cmd, commandFiles, commandsPath);
  }

  await Register(cmd, commandFilesIndividual, foldersPath);

  let commandsLogger = "";
  
  for(const c of cmd) {
    commandsLogger += c.data.name;
    if(cmd.indexOf(c) != cmd.length-1) commandsLogger += ", ";
  }

  console.log(`%c(/) Registering ${cmd.length} commands... (${commandsLogger})`, 'color: #ff9900');

  await client.application.commands.set(cmd.map(c => c.data));

  console.log(`%c(/) Registered ${client != null ? client.application.commands.cache.size : cmd.length} commands !`, 'color: #22bb33');

  return cmd;
}

/**
 * Register commands
 * @param cmd 
 * @param commandFiles 
 * @param foldersPath 
 */
async function Register(cmd: Command[], commandFiles: string[], foldersPath: string) {
  for (const file of commandFiles) {
    const filePath = path.join(foldersPath, file);
    const fileURL = `file:///${filePath}`;
    const module = await import(fileURL);
    const command = module.default;
    cmd.push(command);
  }
}

/**
 * Get all directories
 * @param source The source directory
 * @returns Directories
 */
export function getDirectories(source: string){
    return fs.readdirSync(source, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)
  }