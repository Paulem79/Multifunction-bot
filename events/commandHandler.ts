import { Collection, Events } from "discord.js";

import { HandledEvent } from "../handlers/events.js";
import { cooldowns } from "../index.js";
import { getGlobalMessageByLang, LocaleType } from "../utils/langfinder.js";
import { commands } from "./onStart.js";

const defaultCooldownDuration = 3;

export default {
    async listener(interaction) {
        if (interaction.isChatInputCommand()) {
            if (!interaction.inCachedGuild()) return await interaction.reply({ 
                content: getGlobalMessageByLang(LocaleType.UNAUTHORIZED, interaction),
                ephemeral: true
            });
            
            const slashCommand = commands.find(c => c.data.name === interaction.commandName);
            if (!slashCommand) {
                interaction.reply({
                    content: getGlobalMessageByLang(LocaleType.ERROR, interaction),
                    ephemeral: true
                });
                return;
            }
    
            if (!cooldowns.has(slashCommand.data.name)) {
                cooldowns.set(slashCommand.data.name, new Collection());
            }
    
            const now = Date.now();
            const timestamps = cooldowns.get(slashCommand.data.name);
            const cooldownAmount = (slashCommand.attributes ? (slashCommand.attributes.cooldown ?? defaultCooldownDuration) : defaultCooldownDuration) * 1000;
    
            if (timestamps.has(interaction.user.id)) {
                const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;
    
                if (now < expirationTime) {
                    const expiredTimestamp = Math.round(expirationTime / 1000);
                    await interaction.reply({
                        content: getGlobalMessageByLang(LocaleType.WAIT, interaction).replace("%t", `${expiredTimestamp}`).replace("%c", slashCommand.data.name),
                        ephemeral: true
                    });
                    return;
                }
            }
    
            timestamps.set(interaction.user.id, now);
            setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
    
            try {
                slashCommand.interaction = interaction;
                return await slashCommand.execute(interaction);
            } catch (err) {
                await interaction.reply({
                    content: getGlobalMessageByLang(LocaleType.ERROR, interaction),
                    ephemeral: true
                });
                console.log(err);
                return;
            }
        } else if (interaction.isAutocomplete()) {
            if (!interaction.inCachedGuild()) return;
    
            const slashCommand = commands.find(c => c.data.name === interaction.commandName);
    
            try {
                await slashCommand.autocomplete(interaction);
            } catch (error) {
                console.error(error);
            }
        } else if (interaction.isAnySelectMenu()) {
            if (interaction.message.interaction == undefined) return;
            if (!interaction.inCachedGuild()) return await interaction.reply({ 
                content: getGlobalMessageByLang(LocaleType.UNAUTHORIZED, interaction),
                ephemeral: true
            });
    
            const slashCommand = commands.find(c => c.data.name === interaction.message.interaction.commandName);
    
            try {
                await slashCommand.selectmenu(interaction);
            } catch (error) {
                console.error(error);
            }
        } else if (interaction.isModalSubmit()) {
            if (interaction.message.interaction == undefined) return;
            if (!interaction.inCachedGuild()) return await interaction.reply({ 
                content: getGlobalMessageByLang(LocaleType.UNAUTHORIZED, interaction),
                ephemeral: true
            });
    
            const slashCommand = commands.find(c => c.data.name === interaction.message.interaction.commandName);
    
            try {
                await slashCommand.modal(interaction);
            } catch (error) {
                console.error(error);
            }
        } else if (interaction.isButton()) {
            if (!interaction.inCachedGuild()) return await interaction.reply({ 
                content: getGlobalMessageByLang(LocaleType.UNAUTHORIZED, interaction),
                ephemeral: true
            });
            if (interaction.message.interaction == undefined) return; //defaultButtons(interaction);
    
            const slashCommand = commands.find(c => c.data.name === interaction.message.interaction.commandName);
    
            try {
                await slashCommand.button(interaction);
            } catch (error) {
                console.error(error);
            }
        }
    },
    eventType: Events.InteractionCreate
} as HandledEvent<Events.InteractionCreate>;