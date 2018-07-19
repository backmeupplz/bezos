// Dependencies
import { getMember } from "../models/member"
import { Telegraf, ContextMessageUpdate } from 'telegraf'

/**
 * 
 * @param chatId 
 * @param refId 
 * @param bot 
 */
export async function trySettingUpReferral(chatId: number, refId: number, bot: Telegraf<ContextMessageUpdate>, ctx: ContextMessageUpdate) {
  try {
    await setupReferral(chatId, refId)
    ctx.replyWithHTML(`Поздравляем! Теперь <a href="tg://user?id=${refId}">вот этот пользователь</a> будет получать дополнительный шанс выиграть в розыгрыше бесплатного Ethereum в чате "<a href="${process.env.CHAT_LINK}">Раздача Безоса</a>". Но получит он дополнительный шанс от вас только в те дни, когда вы сами будете активны в чате, и только если вы подписаны на <a href="https://t.me/golden_borodutch">Золото Бородача</a> со включенными уведомлениями.\n\nЕсли вы хотите тоже получать дополнительные шансы на победу в розыгрыше, то попросите друзей перейти по ссылке: t.me/official_bezos_bot?start=${chatId}. Получать дополнительные шансы вы сможете, только если ваши приглашенные друзья тоже будут активными в чате "<a href="${process.env.CHAT_LINK}">Раздача Безоса</a>" и подписанными на <a href="https://t.me/golden_borodutch">Золото Бородача</a> со включенными уведомлениями. Спасибо!`)
  } catch (err) {
    ctx.replyWithHTML(err.message)
  }
}

/**
 * Function to setup the referral link from one person to another
 * @param chatId Id of the person who sets up the referral
 * @param refId Id of the referral receiving end person
 * @throws when there is no sender or receiver, or sender is receiver
 */
async function setupReferral(chatId: number, refId: number) {
  // Get sender and receiver
  const sender = await getMember(chatId)
  const receiver = await getMember(refId)
  // Throw if any one of them is not there
  if (!sender) throw new Error(`Вы еще не отметились в чате "<a href="${process.env.CHAT_LINK}">Раздача Безоса</a>" — напишите туда что-нибудь и попробуйте еще раз, пожалуйста`)
  if (!receiver) throw new Error(`Пользователь, которому вы хотите подарить свою рефералку, еще не отметился в чате <a href="${process.env.CHAT_LINK}">Раздача Безоса</a>" — попросите его написать туда что-нибудь и попробуйте еще раз, пожалуйста`)
  if (chatId === refId) throw new Error(`Ай-я-яй, сегодня сам себе рефералом становишься, а завтра Родину продашь!`)
  // Setup the link
  sender.ref = chatId
  await sender.save()
}