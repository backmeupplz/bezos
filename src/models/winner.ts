// Dependencies
import { prop, Typegoose } from 'typegoose'

// Winner class definition
export class Winner extends Typegoose {
  @prop({ required: true })
  winTimestamp: number
  @prop({ required: true })
  amount: number
  @prop({ required: true })
  chatId: number
  @prop({ required: true })
  name: string

  @prop()
  transaction?: string
}

// Get Winner model
const WinnerModel = new Winner().getModelForClass(Winner)

/**
 * Function to get winners
 * @returns winners
 */
export async function getWinners() {
  let winners = await WinnerModel.find()
  winners = winners.sort((a, b) => a.winTimestamp - b.winTimestamp)
  return winners
}

/**
 * Function to get winner
 * @param chatId Chat id of the winner
 * @returns winner
 */
export async function getWinner(chatId: number) {
  return await WinnerModel.findOne({ chatId })
}

/**
 * Creating a winner
 * @param amount Amount won
 * @param chatId Chat id of the winner
 * @param name Name of the winner
 */
export async function addWinner(amount: number, chatId: number, name: string) {
  const winner = new WinnerModel({
    winTimestamp: Date.now(),
    amount,
    chatId,
    name,
  })
  return await winner.save()
}