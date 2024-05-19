import { Client, Collection, GatewayIntentBits, Guild } from 'discord.js';
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from 'url';

import config from './config.json' assert {"type":"json"};
import bdd from './bdd.json' assert {"type":"json"};

import { HandledEvent, getEvents } from './handlers/events.js';

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

export let client = new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
] });

export function setClient(c: Client<true>) {
    client = c;
}

export let cooldowns: Collection<string, Collection<string, number>> = new Collection();
export let events: HandledEvent<any>[] = [];

(async () => {
    events = await getEvents(__dirname, "events", client);
})().catch(err => {
    console.error(err);
});

export function InitBdd(guild: Guild){
	if(bdd[guild.id] == undefined) bdd[guild.id] = {};
	Savebdd();
}

/**
 * Sauvegarde le contenu de la base de données
 * @returns void
 */
export function Savebdd() {
    fs.writeFileSync("./bdd.json", JSON.stringify(bdd, null, 4));
}

client.login(config.token);