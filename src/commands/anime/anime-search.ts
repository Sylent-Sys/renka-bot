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
import Anilist from 'anilist-node'
import { decode } from 'html-entities'

@Discord()
@SlashGroup({ name: 'anime', description: 'commands related to anime' })
@SlashGroup('anime')
export default class Search {
  async SearchByName(
    query: string,
    command: CommandInteraction | SimpleCommandMessage
  ) {
    const url = `${process.env.MAL_API}/anime?q=${encodeURI(query)}`
    try {
      const dataMal = await (
        await axios.get(url, {
          headers: {
            'X-MAL-CLIENT-ID': String(process.env.MAL_CLIENT_ID),
          },
        })
      ).data.data[0].node
      const dataJikan = await (
        await axios.get(`${process.env.JIKAN_API}/anime/${dataMal.id}/full`)
      ).data.data
      console.log({ dataMal, dataJikan })
      const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle(dataJikan.title)
        .setURL(dataJikan.url)
        .setDescription(dataJikan.synopsis)
        .setThumbnail(dataJikan.images.jpg.image_url)
        .addFields(
          {
            name: 'Score',
            value: String(dataJikan.score),
            inline: true,
          },

          {
            name: 'Episodes',
            value: String(dataJikan.episodes),
            inline: true,
          },
          {
            name: 'Status',
            value: dataJikan.status,
            inline: true,
          },
          {
            name: 'Aired',
            value: dataJikan.aired.string,
            inline: true,
          },
          {
            name: 'Genres',
            value: dataJikan.genres.map((data: any) => data.name).join(', '),
            inline: true,
          },
          {
            name: 'Type',
            value: dataJikan.type,
            inline: true,
          }
        )
      command instanceof SimpleCommandMessage
        ? command.message.reply({ embeds: [embed] })
        : command.reply({ embeds: [embed] })
    } catch (error) {
      console.error(error)
    }
  }
  @Slash('search_by_name')
  searchByNameSlash(
    @SlashOption('nama_anime') nama: string,
    command: CommandInteraction
  ) {
    this.SearchByName(nama, command)
  }
  @SimpleCommand('search_by_name')
  searchByNameSimpleCommand(
    @SimpleCommandOption('nama_anime') nama: string,
    command: SimpleCommandMessage
  ) {
    this.SearchByName(nama, command)
  }
  @SimpleCommand('search_by_image')
  async searchByImage(
    @SimpleCommandOption('tipe') tipe: string,
    @SimpleCommandOption('url') url: string,
    command: SimpleCommandMessage
  ) {
    if (tipe.toLowerCase() === 'url' && url === '') return command.message.reply('url tidak boleh kosong')
    if (tipe.toLowerCase() === 'file' && command.message.attachments.at(0)?.url == null) return command.message.reply('mohon lampirkan gambar')
    try {
      const dataTraceMoe = await (
        await axios.get(
          `${process.env.TRACE_MOE_API}/search?url=${encodeURI(
            String(tipe.toLowerCase() === 'url' ? url : command.message.attachments.at(0)?.url)
          )}`
        )
      ).data
      if (dataTraceMoe.result[0].similarity < 0.85) {
        return command.message.reply('Anime not found')
      }
      const dataAnilist = await new Anilist().media.anime(
        dataTraceMoe.result[0].anilist
      )
      console.log({ dataTraceMoe, dataAnilist })
      const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle(dataAnilist.title.romaji)
        .setURL(dataAnilist.siteUrl)
        .setDescription(this.htmlToString(dataAnilist.description))
        .setThumbnail(dataAnilist.coverImage.medium)
        .addFields(
          {
            name: 'Episodes',
            value: String(dataAnilist.episodes),
            inline: true,
          },
          {
            name: 'Status',
            value: dataAnilist.status,
            inline: true,
          },
          {
            name: 'Genres',
            value: dataAnilist.genres.join(', '),
            inline: true,
          }
        )
      command.message.reply({
        embeds: [embed],
        files: [dataTraceMoe.result[0].video],
      })
    } catch (error) {
      command.message.reply('kesalahan dari sisi user')
    }
  }

  htmlToString(returnText: string) {
    returnText = returnText.replace(/<br>/gi, '\n')
    returnText = returnText.replace(/<br\s\/>/gi, '\n')
    returnText = returnText.replace(/<br\/>/gi, '\n')
    returnText = returnText.replace(/<p.*>/gi, '\n')
    returnText = returnText.replace(
      /<a.*href="(.*?)".*>(.*?)<\/a>/gi,
      ' $2 ($1)'
    )
    returnText = returnText.replace(
      /<script.*>[\w\W]{1,}(.*?)[\w\W]{1,}<\/script>/gi,
      ''
    )
    returnText = returnText.replace(
      /<style.*>[\w\W]{1,}(.*?)[\w\W]{1,}<\/style>/gi,
      ''
    )
    returnText = returnText.replace(/<(?:.|\s)*?>/g, '')
    returnText = returnText.replace(/(?:(?:\r\n|\r|\n)\s*){2,}/gim, '\n\n')
    returnText = returnText.replace(/ +(?= )/g, '')
    returnText = returnText
      .replace(/<[^>]+>/g, '')
      .replace(/&lt/g, '<')
      .replace(/&gt/g, '>')
    return decode(returnText)
  }
}
