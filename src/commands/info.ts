// Dependencies
import { Telegraf, ContextMessageUpdate } from 'telegraf'
import { getActiveAdvertisers, getAdvertiser, Advertiser } from '../models'

/**
 * Setup start and help commands at the provided bot
 * @param bot Bot to setup the commands
 */
export function setupInfo(bot: Telegraf<ContextMessageUpdate>) {
  bot.command('info', async (ctx) => {
    // Should only work in private
    if (ctx.chat.type === 'private') {
      // Get chat advertiser
      const advertiser = await getAdvertiser(ctx.chat.id)
      // Get info text
      const infoText = await getInfoText(ctx, advertiser)
      // Show info
      await ctx.replyWithHTML(infoText, { disable_web_page_preview: true })
      // Show current ad text
      if (advertiser.ad) {
        ctx.replyWithHTML(advertiser.ad)
      }
    }
  })
}

/**
 * Function that gets the info text for the chat
 * @param ctx Context of the received command
 * @param advertiser Advertiser that invokes the command
 * @returns info text to display to the user
 */
async function getInfoText(ctx: ContextMessageUpdate, advertiser: Advertiser) {
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
  result = `${result}\n\n<b>Ваш адрес для</b> <a href="https://etherscan.io/address/${advertiser.ethAddress}">пополнения ETH</a>:\n<code>${advertiser.ethAddress}</code>`
  // Add current ethereum balance
  result = `${result}\n<b>Ваш текущий баланс:</b>\n${position < 0 ? `Показывается, только если у вас больше ${process.env.MIN_ETH}` : advertisersInfo[position].balance} ETH.`
  // Add current text
  if (advertiser.ad) {
    result = `${result}\n\n<b>Текущий рекламный текст:</b>`
  } else {
    result = `${result}\n\n<b>Нет текущего рекламного текста</b> (можете добавить при помощи команды /ad)`
  }

  result = `${result}\n\n`
  return result
}