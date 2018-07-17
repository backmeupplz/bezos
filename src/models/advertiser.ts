// Dependencies
import { pre, prop, Typegoose } from 'typegoose'
import { getNewAccount } from '../helpers/Ethereum'

@pre<Advertiser>('save', (next) => {
  // Add Ethereum address if doesn't exist yet
  if (!this.ethAddress || !this.ethKey) {
    const account = getNewAccount()
    this.ethAddress = account.address
    this.ethKey = account.privateKey
  }
  next()
})
export class Advertiser extends Typegoose {
  @prop({ required: true, index: true, unique: true })
  chatId: number;
  @prop({ required: true })
  ethAddress: string;
  @prop({ required: true })
  ethKey: string;
  @prop()
  ad?: string;
}