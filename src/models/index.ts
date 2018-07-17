// Dependencies
import * as mongoose from 'mongoose'

// Connect to mongoose
mongoose.connect(process.env.MONGO)

// Get models
import { Advertiser } from './advertiser'
// Export models
export { Advertiser }