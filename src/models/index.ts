// Dependencies
import * as mongoose from 'mongoose'

// Connect to mongoose
mongoose.connect(process.env.MONGO, { useNewUrlParser: true })

// Get models
import { Advertiser, getActiveAdvertisers, getAdvertiser } from './advertiser'
import { addRaffle, getRaffle, Raffle } from './raffle'

// Export models
export {
  Advertiser,
  getActiveAdvertisers,
  getAdvertiser,
  addRaffle,
  getRaffle,
  Raffle,
}