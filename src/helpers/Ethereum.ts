// Dependencies
import Web3 from 'web3'
import { Advertiser } from '../models'

// Create web3 instance
export const web3 = new Web3('https://api.myetherapi.com/eth')

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
export function getBalance(advertiser: Advertiser): number {
  const balance = web3.eth.getBalance(advertiser.ethAddress)
  const ether = web3.utils.fromWei(balance, 'ether')
  return ether.toNumber()
}