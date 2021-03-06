// Dependencies
import { Telegraf, ContextMessageUpdate } from 'telegraf'
import { startRaffle } from '../helpers/giveaway';

// Go command
export function setupGo(bot: Telegraf<ContextMessageUpdate>) {
  bot.command('go', async (ctx) => {
    if (ctx.from.id === Number(process.env.ADMIN_CHAT_ID)) {
      startRaffle(bot)
    }
  })
}