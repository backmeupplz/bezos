// Dependencies
import * as mongoose from 'mongoose'

// Connect to mongoose
mongoose.connect(process.env.MONGO, { useNewUrlParser: true })

// Get models
import { Advertiser, getActiveAdvertisers, getAdvertiser } from './advertiser'
// Export models
export { Advertiser,
  getActiveAdvertisers,
  getAdvertiser }