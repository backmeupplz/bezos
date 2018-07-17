// Dependencies
import { Telegraf, ContextMessageUpdate } from 'telegraf'

// Start and help commands
export function setupAd(bot: Telegraf<ContextMessageUpdate>) {
  bot.command('ad', (ctx) => {
    if (ctx.chat.type === 'private') {
      // Add ad
      ctx.reply('Ad')
    }
  })
}