// Dependencies
import { Telegraf, ContextMessageUpdate } from '../../node_modules/telegraf'
import { recordMemberActivity } from '../models/member'

/**
 * Setting up tracker on the provided bot
 * @param bot Bot to setup tracker
 */
export function setupTracker(bot: Telegraf<ContextMessageUpdate>) {
  bot.use((ctx, next) => {
    try {
      checkActivity(ctx)
    } catch (err) {
      // Do nothing
    }
    return next()
  })
}

/**
 * Check if the activity is valid and record it to the member
 * @param ctx Context of the message
 */
function checkActivity(ctx: ContextMessageUpdate) {
  // Get message
  const message = ctx.message
  // If no message (for instance, callback query) then stop
  if (!message) return
  // If not in the chat, then stop
  if (message.chat.id !== Number(process.env.CHAT_ID)) return
  // Record user's activity
  recordMemberActivity(message.from)
}