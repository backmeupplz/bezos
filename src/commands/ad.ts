// Dependencies
import { Telegraf, ContextMessageUpdate } from 'telegraf'
import { getAdvertiser } from '../models'
import { sendForApproval } from '../helpers/approval'

// Start and help commands
export function setupAd(bot: Telegraf<ContextMessageUpdate>) {
  bot.command('ad', async (ctx) => {
    // Works only in private chats
    if (ctx.chat.type === 'private') {
      // Get the message
      const message = ctx.message.text.substring(3).trim()
      // If message is empty
      if (!message) {
        ctx.replyWithHTML('Пожалуйста, пришлите рекламное сообщение в формате <code>/ad рекламное сообщение</code>. Поддерживается HTML.')
        return
      }
      // Try sending the message (HTML might be faulty)
      try {
        await ctx.replyWithHTML(message)
        await ctx.reply('Выше вы можете увидеть, как будет выглядеть ваше рекламное сообщение. Оно отправлено на модерацию админам. Как только оно пройдет (или нет) модерацию, вам придет об этом сообщение. Модерация обычно занимает не более 24 часов. Если хотите заменить его, пошлите новое через /ad. Спасибо!')
        let advertiser = await getAdvertiser(ctx.chat.id)
        advertiser.ad = message
        advertiser.adApproved = false
        advertiser = await advertiser.save()
        sendForApproval(advertiser.chatId, bot)
      } catch (err) {
        ctx.replyWithHTML(`Похоже, в сообщении была какая-то ошибка (скорее всего, что-то не так с HTML, рекламный текст не принят):\n\n<code>${err.message}</code>`)
      }
    }
  })
}