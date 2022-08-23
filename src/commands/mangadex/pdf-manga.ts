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
import path from 'path'
import fs from 'fs'
import PdfPrinter from 'pdfmake'
import {
  BufferOptions,
  TDocumentDefinitions,
  TFontDictionary,
  Content,
} from 'pdfmake/interfaces'
import { Firebase } from '../../utils/firebase.js'

@Discord()
@SlashGroup({
  name: 'mangadex',
  description: 'Commands related to make Mangadex',
})
@SlashGroup('mangadex')
export default class PdfManga {
  fonts: TFontDictionary = {
    Roboto: {
      normal: path.resolve(
        fs.realpathSync('.'),
        'fonts/Roboto/Roboto-Regular.ttf'
      ),
      bold: path.resolve(
        fs.realpathSync('.'),
        'fonts/Roboto/Roboto-Medium.ttf'
      ),
      italics: path.resolve(
        fs.realpathSync('.'),
        'fonts/Roboto/Roboto-Italic.ttf'
      ),
      bolditalics: path.resolve(
        fs.realpathSync('.'),
        'fonts/Roboto/Roboto-MediumItalic.ttf'
      ),
    },
  }
  async pdfManga(
    query: string,
    command: CommandInteraction | SimpleCommandMessage
  ) {
    if (query === '' || query === undefined || query === null)
      return Message.sendReply(command, 'ID tidak boleh kosong')
    const dataMangadexAggregate = await (
      await axios.get(
        `${process.env.MANGADEX_API}/manga/${encodeURI(
          query
        )}/aggregate?translatedLanguage[]=en`
      )
    ).data
    const dataMangadexDetail = await (
      await axios.get(`${process.env.MANGADEX_API}/manga/${encodeURI(query)}`)
    ).data
    if (dataMangadexAggregate === undefined || dataMangadexAggregate === null)
      return Message.sendReply(command, 'Data tidak ditemukan')
    let chapters: Array<{ key: number; id: string }> = []
    Object.entries(dataMangadexAggregate.volumes).forEach(([_key, value]) => {
      const value2: any = value
      Object.entries(value2.chapters).forEach(([_key, value]) => {
        const value2: any = value
        chapters.push({ key: value2.chapter, id: value2.id })
      })
    })
    Message.sendReply(
      command,
      `Manga ini mempunyai ${chapters.length} chapter, saya akan mengunduhnya secara otomatis`
    )
    for await (const value of chapters
      .filter((value, index) => chapters.indexOf(value) === index)
      .sort((a, b) => (a.key > b.key ? 1 : -1))) {
      try {
        const dataUrl = await (
          await axios.get(
            `${process.env.MANGADEX_API}/at-home/server/${encodeURI(value.id)}`
          )
        ).data
        for await (const value2 of dataUrl.chapter.dataSaver) {
          await this.downloadFile(
            `${dataUrl.baseUrl}/data-saver/${dataUrl.chapter.hash}/${value2}`,
            `public/mangadex/${query}/${value.key}`
          )
        }
      } catch (error) {
        let errorMessage = 'Failed to do something exceptional'
        if (error instanceof Error) {
          errorMessage = error.message
        }
        console.log(
          errorMessage,
          value.key,
          `${process.env.MANGADEX_API}/at-home/server/${encodeURI(value.id)}`
        )
      }
    }
    Message.sendReply(command, 'Selesai Mengunduh Manga, lanjut membuat pdf')
    let dataImage: Array<{
      chapter: number
      page: number
      path: string
      totalPage: number
    }> = []
    chapters
      .filter((value, index) => chapters.indexOf(value) === index)
      .sort((a, b) => (a.key > b.key ? 1 : -1))
      .forEach((value) => {
        const totalPage: number = fs.readdirSync(
          path.resolve(
            fs.realpathSync('.'),
            `public/mangadex/${query}/${value.key}`
          )
        ).length
        fs.readdirSync(
          path.resolve(
            fs.realpathSync('.'),
            `public/mangadex/${query}/${value.key}`
          )
        ).forEach((file, index) => {
          dataImage.push({
            chapter: value.key,
            page: index + 1,
            path: path.resolve(
              fs.realpathSync('.'),
              `public/mangadex/${query}/${value.key}/${file}`
            ),
            totalPage: totalPage,
          })
        })
      })
    let contentPdf: Array<Content> = []
    contentPdf.push({
      alignment: 'center',
      text: dataMangadexDetail.data.attributes.title.en,
      bold: true,
      fontSize: 36,
    })
    chapters
      .sort((a, b) => a.key - b.key)
      .forEach((value) => {
        contentPdf.push({
          alignment: 'center',
          text: `Chapter ${value.key}`,
          bold: true,
          fontSize: 24,
        })
        dataImage
          .sort((a, b) => a.chapter - b.chapter)
          .filter((item) => item.chapter === value.key)
          .forEach((value) => {
            contentPdf.push({
              alignment: 'center',
              width: 595.2755907,
              image: value.path,
            })
          })
      })
    const printer = new PdfPrinter(this.fonts)
    const dd: TDocumentDefinitions = {
      pageSize: {
        width: 595.2755907,
        height: 'auto',
      },
      pageMargins: [0, 0, 0, 0],
      content: contentPdf,
    }
    const options: BufferOptions = {
      progressCallback: (progress) => {
        if (progress === 1) {
          console.log('Selesai Membuat PDF')
        }
      },
    }
    const pdfDoc = printer.createPdfKitDocument(dd, options)
    pdfDoc.pipe(
      fs.createWriteStream(
        path.resolve(fs.realpathSync('.'), `public/mangadex/${query}/doc.pdf`)
      )
    )
    pdfDoc.end()
    await new Promise((resolve) => pdfDoc.on('end', resolve))
    const dataFileUpload = await Firebase.uploadFile(
      query,
      path.resolve(fs.realpathSync('.'), `public/mangadex/${query}/doc.pdf`)
    )
    Message.sendReply(command, 'Filemu sedang di upload')
    const dataLinkFile = await Firebase.getDownloadUrl(
      query,
      dataFileUpload?.uuid ?? ''
    )
    Message.sendReply(
      command,
      `Link ini hanya berlaku selama 1 hari dari pesan ini dikirimkan : ${dataLinkFile.url}`
    )
  }

  @Slash({ name: 'make_pdf' })
  pdfMangaSlash(
    @SlashOption({ name: 'id' }) id: string,
    command: CommandInteraction
  ) {
    this.pdfManga(id, command)
  }
  @SimpleCommand({ name: 'make_pdf' })
  pdfMangaSimpleCommand(
    @SimpleCommandOption({ name: 'id' }) id: string,
    command: SimpleCommandMessage
  ) {
    id = command.argString
    this.pdfManga(id, command)
  }
  async downloadFile(fileUrl: string, downloadFolder: string) {
    const fileName = path.basename(fileUrl)
    const localFilePath = path.resolve(
      fs.realpathSync('.'),
      downloadFolder,
      fileName
    )
    fs.mkdirSync(path.resolve(fs.realpathSync('.'), downloadFolder), {
      recursive: true,
    })
    try {
      const response = await axios({
        method: 'GET',
        url: fileUrl,
        responseType: 'stream',
      })
      const w = response.data.pipe(fs.createWriteStream(localFilePath))
      await new Promise((resolve) => w.on('finish', resolve))
      w.end()
      console.log('Successfully downloaded file!')
    } catch (error) {
      let errorMessage = 'Failed to do something exceptional'
      if (error instanceof Error) {
        errorMessage = error.message
      }
      console.log(errorMessage)
    }
  }
}
