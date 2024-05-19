import { Awaitable, Client, ClientEvents } from 'discord.js';
import path from "path";
import fs from "fs";

export interface HandledEvent<Event extends keyof ClientEvents> {
  once?: boolean,
  listener: (...args: ClientEvents[Event]) => Awaitable<void>,
  eventType: Event;
}

/**
 * Get the commands, register them
 * @param dir The directory
 * @param eventPath The path to the command directory (from the file where you use the function)
 * @param client (optional) if you want to register commands from the function
 * @param broadcast Broadcast commands registering
 * @returns The commands
 */
export async function getEvents(dir: string, eventPath: string, client: Client){
  const events: Array<HandledEvent<any>> = [];
  const foldersPath = path.join(dir, eventPath);
  const eventFilesIndividual = fs.readdirSync(foldersPath).filter(file => file.endsWith('.js'));
  const eventFolders = getDirectories(foldersPath);

  for (const folder of eventFolders) {
    // Grab all the command files from the commands directory you created earlier
    const eventsPath = path.join(foldersPath, folder);
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
    await Register(events, eventFiles, eventsPath, client);
  }

  await Register(events, eventFilesIndividual, foldersPath, client);

  console.log(`%c(/) Registered ${events.length} events !`, 'color: #22bb33');

  return events;
}

/**
 * Register commands
 * @param events 
 * @param commandFiles 
 * @param foldersPath 
 */
async function Register(events: HandledEvent<any>[], commandFiles: string[], foldersPath: string, client: Client) {
  for (const file of commandFiles) {
    const filePath = path.join(foldersPath, file);
    const fileURL = `file:///${filePath}`;

    const module = await import(fileURL);
    const event = module.default as HandledEvent<any>;

    if(event.once) client.once(event.eventType, event.listener);
    else client.on(event.eventType, event.listener);

    console.log("%cRegistered " + file + " " + (event.once ? "once" : "on") + " event", 'color: #ff9900');

    events.push(event);
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