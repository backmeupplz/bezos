// Dependencies
import { Telegraf, ContextMessageUpdate } from 'telegraf'
import { getRefsMap } from '../helpers/referral'

/**
 * Setting up /ref_list command
 * @param bot Bot to setup the command
 */
export function setupRefList(bot: Telegraf<ContextMessageUpdate>) {
  bot.command('ref_list', async (ctx) => {
    // Get ref map
    const refsMap = await getRefsMap()
    // Create empty list
    let list: { chatId: string, refCount: number }[] = []
    // Fill list with values
    for (const key in refsMap) {
      const value = refsMap[key]
      list.push({ chatId: key, refCount: value })
    }
    // Sort list
    list = list.sort((a, b) => b.refCount - a.refCount)
    // Get list message
    let result = '<b>Лидерборд участников по количеству активных рефов:</b>'
    list.forEach((member, index) => {
      result = `${result}\n${index + 1}. <a href="tg://user?id=${member.chatId}">${member.refCount}</a>`
    })
    // Reply
    ctx.replyWithHTML(result)
  })
}