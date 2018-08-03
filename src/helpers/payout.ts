// Dependencies
import { Telegraf, ContextMessageUpdate } from 'telegraf'
import { transfer, getRaffleBalance } from './Ethereum'
import { getRaffleByWinnerId } from '../models/raffle'
const ethereumRegex = require('ethereum-regex')

/**
 * Setting up the middleware that checks for the ETH addresses in replies
 * @param bot Bot to setup the middleware
 */
export function setupPayout(bot: Telegraf<ContextMessageUpdate>) {
  bot.use((ctx, next) => {
    try {
      checkPayout(ctx)
    } catch (err) {
      // Do nothing
    } finally {
      next()
    }
  })
}

/**
 * Check if there is a payout message
 * @param ctx Context of the message
 */
async function checkPayout(ctx: ContextMessageUpdate) {
  // Get message
  const message = ctx.message
  // If no message (for instance, callback query) then stop
  if (!message) return
  // If not a reply, then stop
  if (!message.reply_to_message) return
  // If not a reply to bot's message, then stop
  if (message.reply_to_message.from.username !== process.env.USERNAME) return
  // If not an ETH address, then stop
  if (!ethereumRegex({ exact: true }).test(message.text)) return
  // Get raffle
  let raffle = await getRaffleByWinnerId(message.from.id)
  // Return if no raffle or there is a transaction
  if (!raffle || raffle.transaction) return
  // If not enough balance, then stop
  const balance = await getRaffleBalance(raffle)
  if (balance <= 0.005) return
  // Transfer balance
  try {
    const tx = await transfer(raffle.ethAddress, raffle.ethKey, message.text)
    // Notify user
    ctx.replyWithHTML(`${balance} ETH было переведено на <a href="https://etherscan.io/address/${message.text}">${message.text}</a> транзакцией <a href="https://etherscan.io/tx/${tx}">${tx}</a>. Спасибо за участие!`)
    // Save transaction to raffle
    raffle.transaction = tx
    raffle = await raffle.save()
    // Update message
    const text = `${raffle.text} Выигрыш переведен транзакцией: <a href="https://etherscan.io/tx/${tx}">${tx}</a>.`
    await ctx.telegram.editMessageText(raffle.chatId, raffle.messageId, undefined, text, {
      parse_mode: 'HTML',
    })
  } catch (err) {
    ctx.replyWithHTML(`К сожалению, возникла ошибка перевода:\n\n<code>${err.message}</code>`)
  }
}