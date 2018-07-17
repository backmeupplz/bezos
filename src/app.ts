// Get environment variables
import * as dotenv from 'dotenv'
dotenv.config({ path: `${__dirname}/../.env` })
// Dependencies
import { Telegraf, ContextMessageUpdate } from 'telegraf'
const telegraf = require('telegraf')
import { setupStartAndHelp } from './startAndHelp'

// Setup the bot
const bot: Telegraf<ContextMessageUpdate> = new telegraf(process.env.TOKEN, { username: 'official_bezos_bot' })
bot.startPolling()

// Start and help commands
setupStartAndHelp(bot)

bot.on('message', (ctx) => {
  console.log(ctx.message)
})