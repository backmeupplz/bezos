// Dependencies
import { prop, arrayProp, Typegoose } from 'typegoose'
import { getNewAccount } from '../helpers/Ethereum'

// Winner class definition
export class Raffle extends Typegoose {
  @prop({ required: true, index: true })
  chatId: number
  @prop({ required: true, index: true })
  messageId: number
  @prop({ required: true })
  text: string
  @arrayProp({ required: true, default: [], items: Number })
  participantsIds: number[]

  @prop({ required: true })
  ethAddress: string
  @prop({ required: true })
  ethKey: string

  @prop({ index: true })
  winner?: number

  @prop()
  transaction?: string
}

// Get Raffle model
const RaffleModel = new Raffle().getModelForClass(Raffle)

/**
 * Adding new raffle
 * @param chatId Chat id of the raffle
 * @param messageId Message id of the raffle
 * @param text Text of the raffle
 * @returns created raffle
 */
export async function addRaffle(chatId: number, messageId: number, text: string) {
  const account = await getNewAccount()
  let raffle = new RaffleModel({
    chatId,
    messageId,
    text,
    ethAddress: account.address,
    ethKey: account.privateKey,
  })
  return raffle.save()
}

/**
 * Getting existing raffle
 * @param chatId Chat id of the raffle
 * @param messageId Message id of the raffle
 * @returns requested raffle
 */
export async function getRaffle(chatId: number, messageId: number) {
  return RaffleModel.findOne({ chatId, messageId })
}

/**
 * Getting existing raffle
 * @param winner Id of the winner
 * @param messageId Message id of the raffle
 * @returns requested raffle
 */
export async function getRaffleByWinnerId(winner: number) {
  return RaffleModel.findOne({ winner, transaction: { $exists: false } })
}

/**
 * Getting active raffle without winner
 * @returns active raffle
 */
export function getActiveRaffle() {
  return RaffleModel.findOne({ winner: { $exists: false } })
}