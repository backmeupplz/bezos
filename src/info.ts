// Dependencies
import { Telegraf, ContextMessageUpdate } from 'telegraf'
import { getActiveAdvertisers, getAdvertiser } from './models';

/**
 * Setup start and help commands at the provided bot
 * @param bot Bot to setup the commands
 */
export function setupInfo(bot: Telegraf<ContextMessageUpdate>) {
  bot.command('info', async (ctx) => {
    // Should only work in private
    if (ctx.chat.type === 'private') {
      // Get info text
      const infoText = await getInfoText(ctx)
      // Show info
      ctx.replyWithHTML(infoText)
    }
  })
}

/**
 * Function that gets the info text for the chat
 * @returns info text to display to the user
 */
async function getInfoText(ctx: ContextMessageUpdate) {
  // Get chat advertiser
  const advertiser = await getAdvertiser(ctx.chat.id)
  // Get advertisers queue
  const advertisersInfo = getActiveAdvertisers()
  // Add advertisers queue
  let result = '<b>Очередь рекламодателей:</b>'
  if (advertisersInfo.length) {
    // Advertisers exist
    advertisersInfo.forEach((advertiserInfo, index) => {
      result = `${result}\n${index + 1}. ${advertiserInfo.balance} ETH`
    })
  } else {
    // No advertisers
    result = `${result}\nЗдесь пусто. Отличная возможность закинуть минимум ${process.env.MIN_ETH} ETH на свой счет и сразу стать первыми на очереди!`
  }
  // Add queue position
  result = `${result}\n\n<b>Ваша позиция в очереди:</b>`
  const position = advertisersInfo.map(info => info.advertiser.chatId).indexOf(advertiser.chatId)
  if (position < 0) {
    // Not in queue
    if (!advertiser.ad) {
      // No ad yet
      result = `${result}\nУ вас нет активной заявки на рекламный текст. Пожалуйста, отправьте заявку на рекламный текст примерно вот так: <code>/ad @golden_borodutch — это самый лучший канал о розовых утках во всем русскоязычном сегменте Телеграма</code>. Поддерживается HTML разметка.`
    } else if (!advertiser.adApproved) {
      // Ad is not yet approved
      result = `${result}\nВаш рекламный текст еще не прошел модерацию – подождите, пока он пройдет. Вы можете заменить свой текущий рекламный текст, отправив новый вот так: <code>/ad @golden_borodutch — это самый лучший канал о розовых утках во всем русскоязычном сегменте Телеграма</code>. Поддерживается HTML разметка.`
    } else {
      // Ad is there and approved but not enough ETH yet
      result = `${result}\nВаш рекламный ETH кошелек не содержит достаточной суммы для попадания в очередь. Пожалуйста, пополните кошелек ниже. Минимальная сумма, которая должна быть на кошельке — ${process.env.MIN_ETH} ETH.`
    }
  } else {
    if (position === 0) {
      // First
      result = `${result}\nПоздравляем! Вы первые в очереди, а значит, если ваш бюджет не перебьет другой рекламодатель, то ваша реклама будет опубликована в 10:00 по московскому времени.`
    } else {
      // Not first
      result = `${result}\nВаша позиция в очереди: ${position + 1}. Это значит, что рекламодатели, отправившие больше ETH, будут опубликованы раньше вас. Вы можете либо подождать, пока вы станете первыми в очереди (никого с суммой больше не будет), либо добавить больше ETH на свой счет на адрес ниже.`
    }
  }
  // Add ethereum address
  result = `${result}\n\n<b>Ваш адрес для пополнения ETH:</b>\n<a href="https://etherscan.io/address/${advertiser.ethAddress}">${advertiser.ethAddress}</a>`
  // Add current ethereum balance
  result = `${result}\n<b>Ваш текущий баланс:</b>\n${position < 0 ? `Показывается, только если у вас больше ${process.env.MIN_ETH}` : advertisersInfo[position].balance} ETH.`
  // Add current text
  if (advertiser.ad) {
    result = `${result}\n\n<b>Текущий рекламный текст:</b>` // TODO: add current ad text
  }

  result = `${result}\n\n`
  return result
}