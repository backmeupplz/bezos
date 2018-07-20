// Dependencies
import { prop, Typegoose } from 'typegoose'
import { User } from 'telegram-typings'
import { getMemberBalance } from '../helpers/Ethereum'

// Member class definition
export class Member extends Typegoose {
  @prop({ required: true, index: true, unique: true })
  chatId: number
  @prop({ required: true, index: true, default: false })
  active: boolean
  @prop({ index: true })
  ref?: number
  @prop()
  ethWinAddress?: string
  @prop()
  ethWinKey?: string
}

// Get Member model
const MemberModel = new Member().getModelForClass(Member)

/**
 * Function that records user activity
 * @param user User whos activity to record
 */
export async function recordMemberActivity(user: User) {
  // Get member
  const member = await getOrCreateMember(user.id)
  // Set active status
  member.active = true
  // Save member
  member.save()
}

/**
 * Function to get active members
 * @returns active members
 */
export async function getActiveMembers() {
  return await MemberModel.find({ active: true })
}

/**
 * Function to get active members count
 * @returns active members count
 */
export async function getActiveMembersCount() {
  return await MemberModel.count({ active: true })
}

/**
 * Function to get member (or undefined if they don't exist)
 * @param chatId Chat id of the member to get
 * @returns member object or undefined"
 */
export async function getMember(chatId: number) {
  return await MemberModel.findOne({ chatId })
}

/**
 * Getting win balance for a member
 * @param chatId Chat id of the member
 * @returns actual win balance, 0 if no member, 0 if no win
 */
export async function getWinBalance(chatId: number) {
  // Get member
  const member = await getMember(chatId)
  // If no member exists, there is obviously no win balance
  if (!member) return 0
  // If member doesn't have eth win wallet, there is no win balance
  if (!member.ethWinAddress) return 0
  // Return balance
  return await getMemberBalance(member)
}

/**
 * Function that sets everybody's activity to false
 */
export async function resetActivity() {
  return new Promise((res, rej) => {
    MemberModel.updateMany({}, { active: false }, (err) => {
      if (err) return rej(err)
      res()
    })
  })
}

/**
 * Getting or creating a member
 * @param chatId Chat id of the member to find or create
 * @returns member
 */
async function getOrCreateMember(chatId: number) {
  let member = await MemberModel.findOne({ chatId })
  if (!member) {
    member = new MemberModel({ chatId })
    member = await member.save()
  }
  return member
}