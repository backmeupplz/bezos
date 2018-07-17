// Dependencies
import { Advertiser, getAdvertiser } from './models'
import { Telegraf, ContextMessageUpdate } from 'telegraf';

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
  // Send text for approval
  const msg = await bot.telegram.sendMessage(process.env.ADMIN_CHAT_ID,
    `<code>${JSON.stringify(chat, undefined, 2)}</code>\n\n${advertiser.ad}</code>`)
  // Save message to the advertiser
  advertiser.approveMessageChatId = msg.chat.id
  advertiser.approveMessageId = msg.message_id
  await advertiser.save()
  // Edit message to support HTML markup (hack around the incomplete Telegraf)
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