// Dependencies
import { Telegraf, ContextMessageUpdate } from 'telegraf'
import { getWinners } from '../models/winner'
import axios from 'axios'
import { getActiveAdvertisers } from '../models'

/**
 * Setting up /winners command
 * @param bot Bot to setup the command
 */
export function setupWinners(bot: Telegraf<ContextMessageUpdate>) {
  bot.command('winners', async (ctx) => {
    const winners = await getWinners()
    // Get overall prize
    const overallPrize = winners.reduce((prev, curr) => prev + curr.amount, 0)
    let price = 0
    try {
      const priceResponse = await axios.get('https://api.etherscan.io/api?module=stats&action=ethprice')
      price = Number(priceResponse.data.result.ethusd)
    } catch(err) {
      // Do nothing
    }
    const usdWon = (overallPrize * price).toFixed(2)
    // Add overall prize to the result
    let result = `<b>Общий призовой фонд:</b>\n${overallPrize} ETH ~ $${usdWon}`
    // Add winners to the result
    result = `${result}\n\n<b>Победители:</b>`
    for (const winner of winners) {
      if (ctx.chat.type === 'private') {
        result = `${result}\n<a href="tg://user?id=${winner.chatId}">${winner.name}</a> — ${winner.amount} ETH ~ $${(winner.amount * price).toFixed(2)}`
      } else {
        result = `${result}\n${winner.name.replace('@', '')} — ${winner.amount} ETH ~ $${(winner.amount * price).toFixed(2)}`
      }
      if (winner.transaction) {
        result = `${result} (<a href="https://etherscan.io/tx/${winner.transaction}">доказательство</a>)`
      }      
    }
    // Add current prize
    const advertisers = await getActiveAdvertisers()
    if (advertisers.length) {
      const balance = advertisers[0].balance
      result = `${result}\n\n<b>Разыгрывается сегодня:</b>\n${balance} ETH ~ $${(balance * price).toFixed(2)}`
    }
    // Reply
    ctx.replyWithHTML(result, {
      disable_web_page_preview: true
    })
  })
}