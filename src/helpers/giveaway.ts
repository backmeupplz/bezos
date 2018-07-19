// Dependencies
import { getActiveMembers, Member, resetActivity } from '../models/member'
import { shuffle, random } from 'lodash'
import { Telegraf, ContextMessageUpdate } from 'telegraf'
import { getActiveAdvertisers } from '../models'
import { ChatMember, Message } from 'telegram-typings'
import { getRefsMap } from './referral'
import { transfer, getNewAccount } from './Ethereum'

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
  // Save number of participants
  const numberOfParticipants = activeMembers.length
  // Add chances for referrals
  const resultingMembers: any = []
  const refMap = getRefsMap()
  for (const member of activeMembers) {
    if (refMap[member.chatId]) {
      for (let i = 0; i < refMap[member.chatId] + 1; i++) {
        resultingMembers.push(member)
      }
    } else {
      resultingMembers.push(member)
    }
  }
  activeMembers = resultingMembers
  // Shuffle the members array
  activeMembers = shuffle(activeMembers)
  // Get winner
  let winner: Member
  let winnerInfoChannel: ChatMember
  let winnerInfoChat: ChatMember
  while (!winner) {
    // Get random number
    const winnerIndex = random(activeMembers.length-1)
    // Get winner candidate
    const candidate = activeMembers[winnerIndex]
    // Check if they are valid
    try {
      // Check if subscribed to the channel
      winnerInfoChannel = await bot.telegram.getChatMember(Number(process.env.CHANNEL_ID), candidate.chatId)
      if (winnerInfoChannel.status !== 'member' && winnerInfoChannel.status !== 'administrator') continue
      // Check if still in the chat
      winnerInfoChat = await bot.telegram.getChatMember(Number(process.env.CHAT_ID), candidate.chatId)
      if (winnerInfoChat.status !== 'member' && winnerInfoChannel.status !== 'administrator') continue
      // Assign winner
      winner = candidate
    } catch (err) {
      // Do nothing
    }
  }
  // Congratulate winner and give them instructions
  // Had to cast an any type here due to the incomplete Telegraf typings
  const user = winnerInfoChannel.user
  const name = user.username ?
    `<a href="tg://user?id=${user.id}">@${user.username}</a>` :
    `<a href="tg://user?id=${user.id}">${user.first_name}${user.last_name ? ` ${user.last_name}` : ''}</a>`
  const text = `${name}, поздравляем! Вы выиграли сегодняшний приз в ${advertiser.balance} ETH! Всего было вот столько участников: ${numberOfParticipants}. Подождите 5-30 минут, пока транзакция придет к вам на счет, проверьте, что у вас есть выигрышный баланс при помощи команды /help, а после ответьте на любое мое сообщение адресом любого Ethereum кошелька — я сразу же переведу туда ваш выигрыш. Спасибо!`
  await (<any>bot.telegram).sendMessage(Number(process.env.CHAT_ID), text, {
    parse_mode: 'HTML'
  })
  // Get ad
  const ad = `#Реклама\n\n${advertiser.advertiser.ad}\n\n——————————\n<a href="http://telegra.ph/Pravila-i-usloviya-uchastiya-v-Razdache-Bezosa-07-18">Правила группы и условия участия в Раздаче Безоса</a> — обязательны к прочтению. За флуд, спам, флейм пермабан. Модераторам выдали банхаммеры. Хотите увидеть здесь свою рекламу? Пишите в личку боту @official_bezos_bot.`
  // Post ad to the ad channel
  const adMessage: Message = await (<any>bot.telegram).sendMessage(Number(process.env.AD_CHANNEL_ID), ad, {
    parse_mode: 'HTML'
  })
  // Forward message to the chat
  const adForward: Message = await (<any>bot.telegram).forwardMessage(Number(process.env.CHAT_ID),
    Number(process.env.AD_CHANNEL_ID),
    adMessage.message_id)
  // Pin message
  await bot.telegram.pinChatMessage(adForward.chat.id, adForward.message_id, {
    disable_notification: true // TODO: remove
  })
  // Check if winner has ethereum wallet
  if (!winner.ethWinAddress || !winner.ethWinKey) {
    const account = getNewAccount()
    winner.ethWinAddress = account.address
    winner.ethWinKey = account.privateKey
    winner = (<any>winner).save()
  }
  // Transfer advertiser balance to user
  await transfer(advertiser.advertiser.ethAddress, advertiser.advertiser.ethKey, winner.ethWinAddress)
  // Make all users inactive
  await resetActivity()
}