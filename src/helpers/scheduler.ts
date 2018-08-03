// Dependencies
import { scheduleJob } from 'node-schedule'
import { Telegraf, ContextMessageUpdate } from 'telegraf'
import { finishRaffle, startRaffle } from './giveaway';

/**
 * Schedule the giveaway and ad pin
 * @param bot Bot that will pin the ad
 */
export function scheduleGiveaway(bot: Telegraf<ContextMessageUpdate>) {
  scheduleJob('0 0 7 * * * *', async () => {
    await finishRaffle(bot)
    await startRaffle(bot)
  })
}