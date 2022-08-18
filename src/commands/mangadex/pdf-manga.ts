import axios from 'axios'
import { CommandInteraction } from 'discord.js'
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
export default class PdfManga {
  async pdfManga(
    query: string,
    command: CommandInteraction | SimpleCommandMessage
  ) {
    if (query === '' || query === undefined || query === null)
      return Message.sendReply(command, 'Nama tidak boleh kosong')
    const dataMangadex = await (
      await axios.get(
        `${process.env.MANGADEX_API}/manga/${encodeURI(query)}/aggregate`
      )
    ).data
    console.log(dataMangadex)
    if (dataMangadex === undefined || dataMangadex === null)
      return Message.sendReply(command, 'Data tidak ditemukan')
    Message.sendReply(command, 'Under Development')
  }

  @Slash({ name: 'manga_get_by_id' })
  pdfMangaSlash(
    @SlashOption({ name: 'id' }) id: string,
    command: CommandInteraction
  ) {
    this.pdfManga(id, command)
  }
  @SimpleCommand({ name: 'manga_get_by_id' })
  pdfMangaSimpleCommand(
    @SimpleCommandOption({ name: 'id' }) id: string,
    command: SimpleCommandMessage
  ) {
    id = command.argString
    this.pdfManga(id, command)
  }
}
