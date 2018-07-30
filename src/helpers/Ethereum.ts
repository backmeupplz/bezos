// Dependencies
import * as w3 from 'web3' // a hack due to the poor web3 typings
const w3any: any = w3
import Web3 from 'web3'
const Tx = require('ethereumjs-tx')
import { Advertiser, Member } from '../models'
import axios from 'axios'

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
  let ether: number
  try {
    const balance = await web3.eth.getBalance(advertiser.ethAddress)
    ether = web3.utils.fromWei(balance || 0, 'ether')
  } catch (err) {
    // Do nothing
  }
  return ether || 0
}

/**
 * Checks balance of a member
 * @param member Member to check balance
 * @returns Balance of the member in ETH
 */
export async function getMemberBalance(member: Member): Promise<number> {
  let ether: number
  let retry = 0
  while (!ether && retry < 3) {
    try {
      const balance = await web3.eth.getBalance(member.ethWinAddress)
      let ether = web3.utils.fromWei(balance, 'ether')
      console.log(`Got balance for member ${member.chatId}: ${ether}`)
      if (ether < 0.005) ether = 0
    } catch (err) {
      console.log('Error getting member balance:', err)
      retry++
    }
  }
  return ether || 0
}

/**
 * Function to transfer the whole ethereum balance from one address to another
 * @param fromAddress Address of the sender
 * @param fromKey Private key of the sender
 * @param toAddress Address of the receiver
 * @returns transaction hash
 */
export async function transfer(fromAddress: string, fromKey: string, toAddress: string) {
  // Get balance
  const balance = await web3.eth.getBalance(fromAddress)
  // Get nonce
  const txCount = await web3.eth.getTransactionCount(fromAddress)
  // Get gas price
  const prices = await getCurrentGasPrices()
  const gasPrice = prices.high * 1000000000 // Convert to wei
  const gasLimit = 25000
  // Construct the transaction
  const details = {
    nonce: web3.utils.toHex(txCount),
    value: web3.utils.toHex(balance - (gasLimit * gasPrice)),
    gas: web3.utils.toHex(gasLimit),
    gasPrice: web3.utils.toHex(gasPrice),
    to: toAddress,
    from: fromAddress,
  }
  const tx = new Tx(details)
  // Get private key
  const privateKey = new Buffer(fromKey.substring(2), 'hex')
  // Sign transaction
  tx.sign(privateKey)
  // Serialize tx
  const serializedTx = '0x' + tx.serialize().toString('hex')
  return new Promise((res, rej) => {
    // Send tx
    web3.eth.sendSignedTransaction(serializedTx, (err, hash) => {
      if (err) rej(err)
      res(hash)
    })
  }) as Promise<string>
}

/**
 * Getting the current gas prices
 * @returns object with gas prices
 */
async function getCurrentGasPrices() {
  let response = await axios.get('https://ethgasstation.info/json/ethgasAPI.json')
  return {
    low: response.data.safeLow / 10,
    medium: response.data.average / 10,
    high: response.data.fast / 10
  }
}