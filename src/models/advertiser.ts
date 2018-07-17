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

// Get Advertiser model
const AdvertiserModel = new Advertiser().getModelForClass(Advertiser);

/**
 * Getting or creating advertiser
 * @param chatId Chat id of the advertiser to find or create
 * @returns advertiser
 */
export async function getAdvertiser(chatId: number) {
  let advertiser = await AdvertiserModel.findOne({ chatId })
  if (!advertiser) {
    advertiser = new AdvertiserModel({ chatId })
    advertiser = await advertiser.save()
  }
  return advertiser
}