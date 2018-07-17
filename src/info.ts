// Dependencies
import { Telegraf, ContextMessageUpdate } from 'telegraf'

// Start and help commands
export function setupInfo(bot: Telegraf<ContextMessageUpdate>) {
  bot.command('info', (ctx) => {
    if (ctx.chat.type === 'private') {
      // Show info
      ctx.reply('Info')
    }
  })
}