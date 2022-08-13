import type { CommandInteraction } from "discord.js";
import { Discord, SimpleCommand, SimpleCommandMessage, Slash } from "discordx";
import { bot } from "../main.js";

@Discord()
export class Ping {
  @SimpleCommand("ping")
  @Slash("ping")
  ping(command: CommandInteraction | SimpleCommandMessage): void {
    command instanceof SimpleCommandMessage ? command.message.reply(`🏓Latency is ${command.message.createdTimestamp - Date.now()}ms. API Latency is ${Math.round(bot.ws.ping)}ms`) : command.reply(`🏓Latency is ${command.createdTimestamp - Date.now()}ms. API Latency is ${Math.round(bot.ws.ping)}ms`)
  }
}
