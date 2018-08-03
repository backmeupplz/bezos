// Dependencies
import { ContextMessageUpdate, Telegraf } from 'telegraf'
import { addRaffle, getRaffle, Raffle, getActiveAdvertisers } from '../models'
import { ExtraEditMessage, Message } from 'telegraf/typings/telegram-types'
import { shuffle, random } from 'lodash'
import { transfer } from './Ethereum';
import { getActiveRaffle } from '../models/raffle';

/**
 * Starting a new raffle
 * @param bot Bot to start raffle
 */
export async function startRaffle(bot: Telegraf<ContextMessageUpdate>) {
  // Get advertisers
  const advertisers = await getActiveAdvertisers()
  // If no advertisers, then no raffle
  if (!advertisers.length) {
    return
  }
  // Get first advertiser
  const advertiser = advertisers[0]
  // Get ad text
  const text = `${advertiser.advertiser.ad}\n\n***\nСегодняшний рекламодатель разыгрывает ${advertiser.balance} ETH между участниками раздачи. Чтобы участвовать в раздаче, нажмите на кнопку ниже. Хотите купить рекламу на этом канале? Вам к @official_bezos_bot.`;
  // Send message
  const sent: Message = await (<any>bot).telegram.sendMessage(Number(process.env.CHANNEL_ID), text, {
    parse_mode: 'HTML',
  })
  // Add raffle
  const raffle = await addRaffle(sent.chat.id, sent.message_id, text)
  // Move money
  await transfer(
    advertiser.advertiser.ethAddress,
    advertiser.advertiser.ethKey,
    raffle.ethAddress,
  )
  // Add buttons
  const options: ExtraEditMessage = {
    parse_mode: 'HTML',
    reply_markup: getButtons(raffle),
  };
  (<any>options).reply_markup = JSON.stringify(options.reply_markup)
  await bot.telegram.editMessageText(sent.chat.id, sent.message_id, undefined, text, options)
}

/**
 * Setting up callbacl for the raffle participation button
 * @param bot Bot to setup the callback
 */
export function setupCallback(bot: Telegraf<ContextMessageUpdate>) {
  (<any>bot).action(async (data: string, ctx: ContextMessageUpdate) => {
    // Get raffle
    const datas = data.split('~')
    const chatId = Number(datas[0])
    const messageId = Number(datas[1])
    let raffle = await getRaffle(chatId, messageId)
    // Check if raffle is there
    if (!raffle) {
      try {
        await ctx.answerCallbackQuery('Пожалуйста, попробуйте через пару минут', undefined, true)
      } catch (err) {
        console.log(err)
      }
      return
    }
    // Check if already in
    if (raffle.participantsIds.indexOf(ctx.from.id) > -1) {
      try {
        await ctx.answerCallbackQuery('Вы уже принимаете участие, отлично!', undefined, true)
      } catch (err) {
        console.log(err)
      }
      return
    }
    // Add participant and update number
    raffle.participantsIds.push(ctx.from.id)
    raffle = await raffle.save()
    // Reply that they are in
    await await ctx.answerCallbackQuery('Отлично, вы отметились, как участник!', undefined, true)
    // Update counter of participants
    try {
      // Add buttons
      const options: ExtraEditMessage = {
        parse_mode: 'HTML',
        reply_markup: getButtons(raffle),
      }
      const text = `${raffle.text}\n\nКоличество участников: ${raffle.participantsIds.length}.`
      try {
        await ctx.telegram.editMessageText(raffle.chatId, raffle.messageId, undefined, text, options)
      } catch (err) {
        console.log(err)
      }
    } catch (err) {
      // Do nothing
    }
  })
}

/**
 * Buttons for a raffle
 * @param raffle Raffle to provide buttons to
 * @returns buttons for a raffle
 */
function getButtons(raffle: Raffle) {
  return {
    inline_keyboard: [
      [{
        text: 'Участвовать!',
        callback_data: `${raffle.chatId}~${raffle.messageId}`,
      }],
    ],
  }
}

/**
 * Finishing raffle
 * @param bot Bot that should respond
 */
export async function finishRaffle(bot: Telegraf<ContextMessageUpdate>) {
  // Get active raffle
  const raffle = await getActiveRaffle()
  // Do nothing if no active raffle
  if (!raffle) {
    return
  }
  // Get participants ids
  let ids = raffle.participantsIds
  // Get winner
  ids = shuffle(ids)
  const winnerIndex = random(ids.length-1)
  const winnerId = ids[winnerIndex]
  const winner = await bot.telegram.getChatMember(raffle.chatId, winnerId)
  // Announce winner
  const name =
    winner.user.username ? `@${winner.user.username}` :
    `${winner.user.first_name}${winner.user.last_name ? ` ${winner.user.last_name}` : ''}`
  const text = `${raffle.text}\n\n🎉 В этот раз победитель — <a href="tg://user?id=${winner.user.id}">${name}</a>! Поздравляем!\n\nВсего было участников — ${ids.length}. Чтобы получить выигрыш, напишите @official_bezos_bot. Спасибо!`
  await bot.telegram.editMessageText(raffle.chatId, raffle.messageId, undefined, text, {
    parse_mode: 'HTML',
  })
  // Save winner
  raffle.winner = winner.user.id
  // Save text
  raffle.text = text
  await (<any>raffle).save()
}