// Dependencies
import { Telegraf, ContextMessageUpdate } from 'telegraf'
import { getRefsMap } from '../helpers/referral'
import { getMember } from '../models/member';

/**
 * Setting up /ref_list command
 * @param bot Bot to setup the command
 */
export function setupRefList(bot: Telegraf<ContextMessageUpdate>) {
  bot.command('ref_list', async (ctx) => {
    // Get chat member
    const member = await getMember(ctx.from.id)
    // Shouldn't work in public chats
    if (ctx.chat.type !== 'private') return
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
    let prevRefCount = 0
    for (const member of list) {
      if (prevRefCount === member.refCount) {
        result = `${result},  <a href="tg://user?id=${member.chatId}">${member.chatId}</a>`
      } else {
        prevRefCount = member.refCount
        result = `${result}\n${member.refCount}. <a href="tg://user?id=${member.chatId}">${member.chatId}</a>`
      }
    }
    // Add current referral
    if (member.ref) {
      result = `${result}\n\nВаша реферальная сила направлена в сторону <a href="tg://user?id=${member.ref}">вот этого</a> пользователя.`
    }
    // Reply
    ctx.replyWithHTML(result)
  })
}