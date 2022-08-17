import { Pagination } from '@discordx/pagination'
import type { CommandInteraction } from 'discord.js'
import { EmbedBuilder } from 'discord.js'
import {
  Discord,
  MetadataStorage,
  SimpleCommand,
  SimpleCommandMessage,
  Slash,
  SlashGroup,
} from 'discordx'

@Discord()
@SlashGroup({ name: 'utils', description: 'Utility commands' })
@SlashGroup('utils')
export class AllCommand {
  @Slash({ name: 'all-commands' })
  @SimpleCommand({ name: 'all-commands' })
  async pages(
    interaction: CommandInteraction | SimpleCommandMessage
  ): Promise<void> {
    const commands = MetadataStorage.instance.applicationCommands.map((cmd) => {
      return { description: cmd.description, name: cmd.name }
    })

    const pages = commands.map((cmd, i) => {
      return new EmbedBuilder()
        .setFooter({ text: `Page ${i + 1} of ${commands.length}` })
        .setTitle('**Slash command info**')
        .addFields({ name: 'Name', value: cmd.name })
        .addFields({ name: 'Description', value: cmd.description })
    })

    const pagination =
      interaction instanceof SimpleCommandMessage
        ? new Pagination(interaction.message, pages)
        : new Pagination(interaction, pages)
    await pagination.send()
  }
}
