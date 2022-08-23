import { CommandInteraction } from 'discord.js'
import { SimpleCommandMessage } from 'discordx'
import { SIMPLE_COMMAND_OPTIONS, COMMAND_INTERACTION_OPTIONS } from './types.js'
export class Message {
  sendReply(
    command: CommandInteraction | SimpleCommandMessage,
    content: SIMPLE_COMMAND_OPTIONS | COMMAND_INTERACTION_OPTIONS
  ) {
    if (command instanceof SimpleCommandMessage) {
      command.message.reply(content as SIMPLE_COMMAND_OPTIONS)
    } else {
      command.reply(content as COMMAND_INTERACTION_OPTIONS)
    }
  }
}
