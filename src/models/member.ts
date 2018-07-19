// Dependencies
import { prop, Typegoose } from 'typegoose'
import { User } from 'telegram-typings'

// Member class definition
export class Member extends Typegoose {
  @prop({ required: true, index: true, unique: true })
  chatId: number
  @prop({ required: true, index: true, default: false })
  active: boolean
  @prop({ index: true })
  ref?: number
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
 */
export async function getActiveMembers() {
  return await MemberModel.find({ active: true })
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