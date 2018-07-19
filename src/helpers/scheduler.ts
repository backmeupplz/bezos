// Dependencies
import { scheduleJob } from 'node-schedule'
import { giveaway } from './giveaway';
import { Telegraf, ContextMessageUpdate } from 'telegraf'

/**
 * Schedule the giveaway and ad pin
 * @param bot Bot that will pin the ad
 */
export function scheduleGiveaway(bot: Telegraf<ContextMessageUpdate>) {
  scheduleJob('0 0 7 * * * *', () => {
    giveaway(bot)
  })
}