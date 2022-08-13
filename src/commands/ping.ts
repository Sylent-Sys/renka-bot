import type { CommandInteraction } from 'discord.js'
import { Discord, SimpleCommand, SimpleCommandMessage, Slash } from 'discordx'
import { bot } from '../main.js'

@Discord()
export class Ping {
  @SimpleCommand('ping')
  @Slash('ping')
  ping(command: CommandInteraction | SimpleCommandMessage): void {
    command instanceof SimpleCommandMessage
      ? command.message.reply(
          `🏓Latency is ${
            Date.now() - command.message.createdTimestamp
          }ms. API Latency is ${Math.round(bot.ws.ping)}ms`
        )
      : command.reply(
          `🏓Latency is ${
            Date.now() - command.createdTimestamp
          }ms. API Latency is ${Math.round(bot.ws.ping)}ms`
        )
  }
}
