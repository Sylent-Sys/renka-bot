import 'reflect-metadata'
import 'dotenv/config'
import { dirname, importx } from '@discordx/importer'
import type { Interaction, Message } from 'discord.js'
import { IntentsBitField } from 'discord.js'
import { Client } from 'discordx'
import { randomUUID } from 'crypto'

export const bot = new Client({
  botId: process.env.BOT_ID ?? randomUUID(),
  botGuilds: [(client) => client.guilds.cache.map((guild) => guild.id)],
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildMessageReactions,
    IntentsBitField.Flags.GuildVoiceStates,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.DirectMessageReactions,
  ],
  silent: false,
  simpleCommand: {
    prefix: '>',
  },
})

bot.once('ready', async () => {
  await bot.guilds.fetch()
  await bot.initApplicationCommands()
  console.log('Bot started')
})

bot.on('interactionCreate', (interaction: Interaction) => {
  bot.executeInteraction(interaction)
})

bot.on('messageCreate', (message: Message) => {
  bot.executeCommand(message)
})

async function run() {
  await importx(dirname(import.meta.url) + '/{events,commands}/**/*.{ts,js}')
  if (!process.env.BOT_TOKEN) {
    throw Error('Could not find BOT_TOKEN in your environment')
  }
  await bot.login(process.env.BOT_TOKEN)
}

run()
