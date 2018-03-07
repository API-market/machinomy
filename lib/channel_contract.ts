import uuid = require('uuid')
import * as Web3 from 'web3'
import * as BigNumber from 'bignumber.js'
import { TransactionResult } from 'truffle-contract'
import log from './util/log'
import Signature from './signature'
import { Unidirectional, TokenUnidirectional, buildCPUContract } from '@machinomy/contracts'
const LOG = log('ChannelContract')

const CREATE_CHANNEL_GAS = 300000

export default class ChannelContract { 
  private web3: Web3

  constructor (web3: Web3) {
    this.web3 = web3
  }

  private static generateId (): string {
    return uuid.v4().replace(/-/g, '')
  }

  async open (sender: string, receiver: string, price: BigNumber.BigNumber, settlementPeriod: number): Promise<TransactionResult> {
    LOG(`Creating channel. Value: ${price} / Settlement: ${settlementPeriod}`)

    const deployed = await this.buildChannelContract()

    if(process.env.ERC20CONTRACT_ADDRESS != null)
    {

       let instanceCPU = await buildCPUContract(process.env.ERC20CONTRACT_ADDRESS as string, this.web3)
       let deployedCPU = await instanceCPU.deployed()

       await deployedCPU.approve(deployed.address, price, {
         from: sender,
         gas: CREATE_CHANNEL_GAS
       })

       return deployed.open(ChannelContract.generateId(), receiver, settlementPeriod, process.env.ERC20CONTRACT_ADDRESS as string, price, {
         from: sender,
         gas: CREATE_CHANNEL_GAS
       })
    }

    return deployed.open(ChannelContract.generateId(), receiver, settlementPeriod, {
      from: sender,
      value: price,
      gas: CREATE_CHANNEL_GAS
    })
  }

  async claim (receiver: string, channelId: string, value: BigNumber.BigNumber, signature: Signature, provider: string): Promise<TransactionResult> {
    LOG(`Claiming channel with id ${channelId} on behalf of receiver ${receiver}`)
    LOG(`Values: ${value} / Signature: ${signature.toString()}`)
    const deployed = await this.buildChannelContract()
    return deployed.claim(channelId, value, signature.toString(), provider, 
      { from: receiver,
         gas: CREATE_CHANNEL_GAS })
  }

  async deposit (sender: string, channelId: string, value: BigNumber.BigNumber): Promise<TransactionResult> {
    LOG(`Depositing ${value} into channel ${channelId}`)
    const deployed = await this.buildChannelContract()
    if(process.env.ERC20CONTRACT_ADDRESS != null)
    {

       let instanceCPU = await buildCPUContract(process.env.ERC20CONTRACT_ADDRESS as string, this.web3)
       let deployedCPU = await instanceCPU.deployed()

       await deployedCPU.approve(deployed.address, value, {
         from: sender,
         gas: CREATE_CHANNEL_GAS
       })

       return deployed.deposit(channelId, value, {
         from: sender,
         gas: CREATE_CHANNEL_GAS
       })
    }
    return deployed.deposit(channelId, {
      from: sender,
      value: value,
      gas: CREATE_CHANNEL_GAS
    })
  }

  async getState (channelId: string): Promise<number> {
    LOG(`Fetching state for channel ${channelId}`)
    const deployed = await this.buildChannelContract()
    const isOpen = await deployed.isOpen(channelId)
    const isSettling = false
    if (isOpen) {
      return 0
    }

    if (isSettling) {
      return 1
    }

    return 2
  }

  async startSettle (account: string, channelId: string): Promise<TransactionResult> {
    LOG(`Starting settle for account ${account} and channel id ${channelId}.`)
    const deployed = await this.buildChannelContract()
    return deployed.startSettling(channelId, { from: account })
  }

  async finishSettle (account: string, channelId: string): Promise<TransactionResult> {
    LOG(`Finishing settle for account ${account} and channel ID ${channelId}.`)
    const deployed = await this.buildChannelContract()
    return deployed.settle(channelId, { from: account, gas: 400000 })
  }

  async paymentDigest (channelId: string, value: BigNumber.BigNumber): Promise<string> {
    const deployed = await this.buildChannelContract()
    return deployed.paymentDigest(channelId, value)
  }

  async canClaim (channelId: string, payment: BigNumber.BigNumber, receiver: string, signature: Signature) {
    const deployed = await this.buildChannelContract()
    return deployed.canClaim(channelId, payment, receiver, signature.toString())
  }

  private async buildChannelContract () {
    if (process.env.ERC20CONTRACT_ADDRESS != null) {
        this._contract = process.env.CONTRACT_ADDRESS ?
          await TokenUnidirectional.contract(this.web3.currentProvider).at(process.env.CONTRACT_ADDRESS as string) :
          await TokenUnidirectional.contract(this.web3.currentProvider).deployed()
          LOG(`${this._contract.address}`)
        return this._contract
    } else {
        this._contract = process.env.CONTRACT_ADDRESS ?
          await Unidirectional.contract(this.web3.currentProvider).at(process.env.CONTRACT_ADDRESS as string) :
          await Unidirectional.contract(this.web3.currentProvider).deployed()
          LOG(`${this._contract.address}`)
        return this._contract
    }
  }
}
