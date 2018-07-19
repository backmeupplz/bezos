// Dependencies
import { Telegraf, ContextMessageUpdate } from 'telegraf'
import { giveaway } from '../helpers/giveaway'

/**
 * Setting up /giveaway admin command
 * @param bot Bot to setup the command
 */
export function setupGiveaway(bot: Telegraf<ContextMessageUpdate>) {
  bot.command('giveaway', (ctx) => {
    if (ctx.from.id === Number(process.env.ADMIN_CHAT_ID)) {
      giveaway(bot)
    }
  })
}