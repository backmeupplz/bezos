// Get environment variables
import * as dotenv from 'dotenv'
dotenv.config({ path: `${__dirname}/../.env` })
// Dependencies
import { Telegraf, ContextMessageUpdate } from 'telegraf'
const telegraf = require('telegraf')
import { setupStartAndHelp } from './commands/startAndHelp'
import { setupAd } from './commands/ad'
import { setupInfo } from './commands/info'
import { setupApproveCallback } from './helpers/approval'
import { setupTracker } from './helpers/activityTracker'
import { scheduleGiveaway } from './helpers/scheduler'

// Setup the bot
const bot: Telegraf<ContextMessageUpdate> = new telegraf(process.env.TOKEN, { username: 'official_bezos_bot' })
bot.startPolling()

// Track activity
setupTracker(bot)
// Start and help commands
setupStartAndHelp(bot)
// Ad command
setupAd(bot)
// Info command
setupInfo(bot)
// Setup approval callback
setupApproveCallback(bot)

// Schedule giveaway job
scheduleGiveaway()