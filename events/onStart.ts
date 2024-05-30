import { ActivityType, Events } from "discord.js";

import { HandledEvent } from "../handlers/events.js";
import { InitBdd, __dirname, setClient } from "../index.js";
import { getCommands, Command } from "../handlers/commands.js";

export let commands: Command[] = [];

export default {
    once: true,
    
    async listener(c) {
        setClient(c);

        try {
            commands = await getCommands(__dirname, "commands", c);
        } catch(err) {
            console.error(err);
        }

        setInterval(() => {
            c.user.setActivity(`${c.guilds.cache.size} serveurs`, { type: ActivityType.Watching });
        }, 10000);

        c.guilds.cache.forEach((guild) => {
            InitBdd(guild);
        });

        console.log(`Ready! Logged in as ${c.user.tag}`);
    },

    eventType: Events.ClientReady
} as HandledEvent<Events.ClientReady>;