import type { CommandInteraction } from 'discord.js'
import { Discord, SimpleCommand, SimpleCommandMessage, Slash } from 'discordx'
import { bot } from '../main.js'

@Discord()
export class Ping {
  @SimpleCommand('ping')
  @Slash('ping')
  ping(command: CommandInteraction | SimpleCommandMessage): void {
    command instanceof SimpleCommandMessage
      ? command.message.channel.send('Loading data').then(async (msg) => {
          msg.delete()
          command.message.reply(
            `🏓Latency is ${
              msg.createdTimestamp - command.message.createdTimestamp
            }ms. API Latency is ${Math.round(bot.ws.ping)}ms`
          )
        })
      : command.channel?.send('Loading data').then(async (msg) => {
          msg.delete()
          command.reply(
            `🏓Latency is ${
              msg.createdTimestamp - command.createdTimestamp
            }ms. API Latency is ${Math.round(bot.ws.ping)}ms`
          )
        })
  }
}
