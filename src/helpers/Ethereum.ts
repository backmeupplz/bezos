// Dependencies
import * as w3 from 'web3' // a hack due to the poor web3 typings
const w3any: any = w3
import Web3 from 'web3'
import { Advertiser, Member } from '../models'

// Create web3 instance
export const web3: Web3 = new w3any('https://api.myetherapi.com/eth')

/**
 * Function to get new Ethereum wallet
 * @returns Ethereum wallet details
 */
export function getNewAccount() {
  return web3.eth.accounts.create()
}

/**
 * Checks balance of an advertiser
 * @param advertiser Advertiser to check balance
 * @returns Balance of the advertiser in ETH
 */
export async function getBalance(advertiser: Advertiser): Promise<number> {
  const balance = await web3.eth.getBalance(advertiser.ethAddress)
  const ether = web3.utils.fromWei(balance || 0, 'ether')
  return ether
}

/**
 * Checks balance of a member
 * @param member Member to check balance
 * @returns Balance of the member in ETH
 */
export async function getMemberBalance(member: Member): Promise<number> {
  const balance = await web3.eth.getBalance(member.ethWinAddress)
  const ether = web3.utils.fromWei(balance || 0, 'ether')
  return ether
}

/**
 * Function to transfer the whole ethereum balance from one address to another
 * @param fromAddress Address of the sender
 * @param fromKey Private key of the sender
 * @param toAddress Address of the receiver
 */
export async function transfer(fromAddress: string, fromKey: string, toAddress: string){
  // TODO: implement
  console.log(`Transferring ETH from ${fromAddress} to ${toAddress}`)
}