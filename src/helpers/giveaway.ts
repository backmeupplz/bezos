// Dependencies
import { getActiveMembers, Member } from "../models/member"
import { shuffle, random } from 'lodash'
import { Telegraf, ContextMessageUpdate } from 'telegraf'
import { getActiveAdvertisers } from '../models'
import { ChatMember } from 'telegram-typings'

/**
 * Function that starts giveaway
 * @param bot Bot that will pin the ad
 * @description If there are advertisers, it will repin the ad to the new one, select a random
 * active member and tell them that they won as well as how to get the prize. Then it will transfer the advertiser's
 * budget to the secure wallet that will wait untill the prize is claimed. Also it resets all member's activity status
 * to false
 */
export async function giveaway(bot: Telegraf<ContextMessageUpdate>) {
  // Check if there are ads
  const activeAdvertisers = await getActiveAdvertisers()
  if (!activeAdvertisers.length) {
    bot.telegram.sendMessage(Number(process.env.CHAT_ID), 'Приносим наши извинения, но сегодня не оказалось рекламодателей, которые хотели бы проспонсировать раздачу Ethereum. Если вы хотите купить рекламу в этом чате, милости прошу ко мне в личку — @official_bezos_bot. Спасибо!')
    return
  }
  // Get advertiser
  const advertiser = activeAdvertisers[0]
  // Get shuffled list of the active members
  let activeMembers = await getActiveMembers()
  activeMembers = shuffle(activeMembers)
  // Get winner
  let winner: Member
  let winnerInfo: ChatMember
  while (!winner) {
    // Get random number
    const winnerIndex = random(activeMembers.length-1)
    // Get winner candidate
    const candidate = activeMembers[winnerIndex]
    // Check if they are valid
    try {
      // Check if subscribed to the channel
      winnerInfo = await bot.telegram.getChatMember(Number(process.env.CHANNEL_ID), candidate.chatId)
      // Check if still in the chat
      await bot.telegram.getChatMember(Number(process.env.CHAT_ID), candidate.chatId)
      // Assign winner
      winner = candidate
    } catch (err) {
      // Do nothing
    }
  }
  // Congratulate winner and give them instructions
  // Had to cast an any type here due to the incomplete Telegraf typings
  const user = winnerInfo.user
  const name = user.username ?
    `<a href="tg://user?id=${user.id}">${user.username}</a>` :
    `<a href="tg://user?id=${user.id}">${user.first_name}${user.last_name ? ` ${user.last_name}` : ''}</a>`
  const text = `${name}, поздравляем! Вы выиграли сегодняшний приз! К сожалению, процесс розыгрыша еще не реализован, поэтому ваш выигрыш в этот раз чисто символичен. Процесс розыгрыша реального Ethereum будет реализован в ближайшее время. Спасибо!`
  await (<any>bot.telegram).sendMessage(Number(process.env.CHAT_ID), text, {
    parse_mode: 'HTML'
  })

  /**
   * TODO:
   * — Pin advertiser's message
   * — Transfer advertiser's balance to secure wallet
   * — Add this wallet to the user object in db
   * — Give user instructions how to get the prize
   * — Set active flag for all users to false
   */
}