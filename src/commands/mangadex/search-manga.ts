import { Pagination } from '@discordx/pagination'
import axios from 'axios'
import { CommandInteraction, EmbedBuilder } from 'discord.js'
import {
  Discord,
  SimpleCommand,
  SimpleCommandMessage,
  SimpleCommandOption,
  Slash,
  SlashGroup,
  SlashOption,
} from 'discordx'
import { Message } from '../../utils/message.js'

@Discord()
@SlashGroup({ name: 'mangadex', description: 'Commands related to mangadex' })
@SlashGroup('mangadex')
export default class Search {
  async searchByName(
    query: string,
    command: CommandInteraction | SimpleCommandMessage
  ) {
    if (query === '' || query === undefined || query === null)
      return Message.sendReply(command, 'Nama tidak boleh kosong')
    const dataMangadex = await (
      await axios.get(
        `${process.env.MANGADEX_API}/manga?title=${encodeURI(query)}`
      )
    ).data
    console.log(dataMangadex)
    if (dataMangadex.length === 0)
      return Message.sendReply(command, 'Data tidak ditemukan')
    const pages = dataMangadex.data.map((manga: any, index: number) => {
      return new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle(`${index + 1}. ${manga.attributes.title.en}`)
        .setDescription(`${manga.attributes.description.en}`)
        .addFields(
          {
            name: `ID`,
            value: manga.id,
            inline: true,
          },
          {
            name: 'Status',
            value: manga.attributes.status,
            inline: true,
          },
          {
            name: `Tags`,
            value: manga.attributes.tags
              .map((data: any) => data.attributes.name.en)
              .join(', '),
          }
        )
    })
    const pagination =
      command instanceof SimpleCommandMessage
        ? new Pagination(command.message, pages)
        : new Pagination(command, pages)
    await pagination.send()
  }

  @Slash({ name: 'manga_search_by_name' })
  searchByNameSlash(
    @SlashOption({ name: 'nama' }) nama: string,
    command: CommandInteraction
  ) {
    this.searchByName(nama, command)
  }
  @SimpleCommand({ name: 'manga_search_by_name' })
  searchByNameSimpleCommand(
    @SimpleCommandOption({ name: 'nama' }) nama: string,
    command: SimpleCommandMessage
  ) {
    nama = command.argString
    this.searchByName(nama, command)
  }
}
