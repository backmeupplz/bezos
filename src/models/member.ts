// Dependencies
import { prop, Typegoose } from 'typegoose'
import { User } from 'telegram-typings'

// Member class definition
export class Member extends Typegoose {
  @prop({ required: true, index: true, unique: true })
  chatId: number
  @prop({ required: true, index: true, default: false })
  active: boolean
}

// Get Member model
const MemberModel = new Member().getModelForClass(Member)

/**
 * Function that records user activity
 * @param user User whos activity to record
 */
export async function recordMemberActivity(user: User) {
  // Get member
  const member = await getMember(user.id)
  // Set active status
  member.active = true
  // Save member
  member.save()
}

/**
 * Getting or creating a member
 * @param chatId Chat id of the member to find or create
 * @returns member
 */
async function getMember(chatId: number) {
  let member = await MemberModel.findOne({ chatId })
  if (!member) {
    member = new MemberModel({ chatId })
    member = await member.save()
  }
  return member
}