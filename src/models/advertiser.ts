// Dependencies
import { prop, Typegoose } from 'typegoose'
import { getNewAccount, getBalance } from '../helpers/Ethereum'

// Advertiser class definition
export class Advertiser extends Typegoose {
  @prop({ required: true, index: true, unique: true })
  chatId: number
  @prop({ required: true })
  ethAddress: string
  @prop({ required: true })
  ethKey: string
  @prop()
  ad?: string
  @prop({ required: true, default: false })
  adApproved: boolean
  @prop()
  approveMessageChatId?: number
  @prop()
  approveMessageId?: number
}

// Get Advertiser model
const AdvertiserModel = new Advertiser().getModelForClass(Advertiser)

/**
 * Getting or creating advertiser
 * @param chatId Chat id of the advertiser to find or create
 * @returns advertiser
 */
export async function getAdvertiser(chatId: number) {
  let advertiser = await AdvertiserModel.findOne({ chatId })
  if (!advertiser) {
    const account = getNewAccount()
    advertiser = new AdvertiserModel({ chatId, ethAddress: account.address, ethKey: account.privateKey })
    advertiser = await advertiser.save()
  }
  return advertiser
}

// Active advertisers with cache

// Cache
let activeAdvertisers: { advertiser: Advertiser, balance: number }[] = []

/**
 * Getter function for the cache
 * @returns cached array of advertisers with their balance
 */
export function getActiveAdvertisers() {
  return activeAdvertisers
}

/**
 * Function to start refreshing active advertisers cache, called upon creation
 */
(function startRefreshingActiveAdvertisers() {
  // Refresh now
  refreshActiveAdvertisersForCache()
  // Refresh every 5 minutes
  setInterval(() => {
    refreshActiveAdvertisersForCache()
  }, 5 * 60 * 1000)
})()

/**
 * Function to refresh active advertisers
 */
async function refreshActiveAdvertisersForCache() {
  const advertisersWithAds = await AdvertiserModel.find({ ad: { $exists: true }, adApproved: true })
  const advertisersWithAdsAndBalance = []
  for (const advertiser of advertisersWithAds) {
    const balance = await getBalance(advertiser)
    if (balance >= Number(process.env.MIN_ETH)) { // TODO: find a better way to cut down advertisers without sufficient balance
      advertisersWithAdsAndBalance.push({ advertiser, balance })
    }
    await delay(1) // need this delay due to the my ether api limits
  }
  activeAdvertisers = advertisersWithAdsAndBalance.sort((a, b) => b.balance - a.balance)
}

/**
 * Sleep function for the typescript
 * @param s Number of seconds to sleep
 */
function delay(s: number) {
  return new Promise(resolve => setTimeout(resolve, s * 1000))
}