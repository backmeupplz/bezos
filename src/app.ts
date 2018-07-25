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
import { setupGiveaway } from './commands/giveaway'
import { setupPayout } from './helpers/payout'
import { setupRefList } from './commands/refList'
import { setupWinners } from './commands/winners'

// Setup the bot
const bot: Telegraf<ContextMessageUpdate> = new telegraf(process.env.TOKEN, { username: process.env.USERNAME })
bot.startPolling()

// Track activity
setupTracker(bot)

// Setup payout
setupPayout(bot)

// Setup commands
setupStartAndHelp(bot)
setupAd(bot)
setupInfo(bot)
setupGiveaway(bot)
setupRefList(bot)
setupWinners(bot)

// Setup approval callback
setupApproveCallback(bot)

// Schedule giveaway job
scheduleGiveaway(bot)