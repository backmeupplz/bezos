// Dependencies
import { getAdvertiser } from '../models'
import { Telegraf, ContextMessageUpdate } from 'telegraf'

/**
 * Function to send advertiser for approval
 * @param advertiser Advertiser to be approved
 * @param bot Bot to communicate with the admin
 */
export async function sendForApproval(advertiserId: number, bot: Telegraf<ContextMessageUpdate>) {
  // Get advertiser (for some reason we have to do it again because save() didn't work when passing an Advertiser here)
  const advertiser = await getAdvertiser(advertiserId)
  // Get advertiser chat
  const chat = await bot.telegram.getChat(advertiserId)
  // Remove previous message if it exists
  if (advertiser.approveMessageChatId || advertiser.approveMessageId) {
    await bot.telegram.deleteMessage(advertiser.approveMessageChatId, advertiser.approveMessageId)
  }
  // Send text for approval
  const msg = await bot.telegram.sendMessage(process.env.ADMIN_CHAT_ID,
    `<a href="tg://user?id=${chat.id}">${chat.username ? `@${chat.username}, ` : ''}${chat.first_name || 'no_first_name'} ${chat.last_name || 'no_last_name'}</a>\n\n${advertiser.ad}`)
  // Save message to the advertiser
  advertiser.approveMessageChatId = msg.chat.id
  advertiser.approveMessageId = msg.message_id
  await advertiser.save()
  // Edit message to support HTML markup (hack around the incomplete Telegraf typings)
  bot.telegram.editMessageText(msg.chat.id, msg.message_id, undefined, msg.text, {
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Любо 👍', callback_data: `a~${advertiser.chatId}`},
        { text: 'Гадко 👎', callback_data: `d~${advertiser.chatId}`}]
      ]
    }
  })
}

/**
 * Settign up the callback for the approve buttons
 * @param bot Bot to setup the callback
 */
export function setupApproveCallback(bot: Telegraf<ContextMessageUpdate>) {
  const anybot: any = bot
  anybot.action(/.+/, async (ctx: ContextMessageUpdate) => {
    // Check if admin
    if (ctx.from.id !== Number(process.env.ADMIN_CHAT_ID)) return
    // Get data
    const data = ctx.callbackQuery.data.split('~')
    // Check if approved or disapproved
    if (['a', 'd'].indexOf(data[0]) < 0) {
      return
    }
    // Get approves
    const approved = data[0] === 'a'
    const chatId = Number(data[1])
    // Get advertiser
    const advertiser = await getAdvertiser(chatId)
    // Edit message to reflect
    const message = ctx.callbackQuery.message
    bot.telegram.editMessageText(message.chat.id,
      message.message_id,
      undefined,
      `${approved ? '👍' : '👎'} <a href="tg://user?id=${chatId}">${message.text.split('\n')[0]}</a>\n\n${advertiser.ad}`,
      { parse_mode: 'HTML'})
    if (approved) {
      // Approved
      advertiser.adApproved = true
      advertiser.approveMessageChatId = undefined
      advertiser.approveMessageId = undefined
      await advertiser.save()
      // Notify advertiser
      bot.telegram.sendMessage(advertiser.chatId, 'Поздравляем! Ваш текущий рекламный текст прошел модерацию. Вы можете увидеть всю нужную информацию, воспользовавшись командой /info.')
    } else {
      // Disapproved
      advertiser.adApproved = false
      advertiser.ad = undefined
      advertiser.approveMessageChatId = undefined
      advertiser.approveMessageId = undefined
      await advertiser.save()
      // Notify advertiser
      bot.telegram.sendMessage(advertiser.chatId, 'К сожалению, ваш рекламный текст был отклонен. За причиной к @borodutch, чтобы отправить новый рекламный текст, воспользуйтесь командой /ad. Спасибо!')
    }
  })
}