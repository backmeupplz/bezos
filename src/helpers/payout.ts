// Dependencies
import { Telegraf, ContextMessageUpdate } from 'telegraf'
import { getWinBalance, getMember } from '../models/member';
import { transfer, getMemberBalance } from './Ethereum';
const ethereumRegex = require('ethereum-regex')

/**
 * Setting up the middleware that checks for the ETH addresses in replies
 * @param bot Bot to setup the middleware
 */
export function setupPayout(bot: Telegraf<ContextMessageUpdate>) {
  bot.use((ctx, next) => {
    checkPayout(ctx)
    return next()
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
  // If not enough balance, then stop
  const balance = await getWinBalance(message.from.id)
  if (balance <= 0) return
  // Transfer balance
  const member = await getMember(message.from.id)
  // TODO: add try/catch
  const tx = await transfer(member.ethWinAddress, member.ethWinKey, message.text)
  // Notify user
  // TODO: add tx number
  ctx.reply(`${balance} ETH было переведено на <a href="https://etherscan.io/address/${message.text}">${message.text}</a>. Спасибо за участие!`)
}