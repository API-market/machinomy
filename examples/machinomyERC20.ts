import * as configuration from '../lib/configuration'
import Web3 = require('web3')
import Machinomy from '../index'
import * as express from 'express'
import Payment from '../lib/Payment'
import * as bodyParser from 'body-parser'
import { buildCPUContract } from '@machinomy/contracts'

const fs = require('fs')
let sender = '0x4bdcca2d324ebf8c7fbd3d092a9f001f40936981'
let receiver = '0x36403b09306302562e6f7679f77bf08f7cb29e20'

process.env.CONTRACT_ADDRESS = "0x94f400e37f8fc86b9e8ff3e4e2b247592fbf890f"
process.env.ERC20CONTRACT_ADDRESS = "0x208a1e26192fa348ec39c2e96f22e64af7392d79"
const provider = new Web3.providers.HttpProvider('http://localhost:8545')
const web3 = new Web3(provider)

let machinomyHub = new Machinomy(receiver, web3, {engine: 'nedb', databaseFile: 'serverDB'})
let hub = express()
hub.use(bodyParser.json())
hub.use(bodyParser.urlencoded({ extended: false }))
hub.post('/machinomy', async (req: express.Request, res: express.Response, next: Function) => {
  let body = await machinomyHub.acceptPayment(req.body)
  res.status(200).send(body)
})
let port = 3001
let server = hub.listen(port, function () {
  console.log('HUB is ready on port ' + port)
})

let f = async () => {
  /////// ERC20
  console.log('================================')
  console.log('ERC20')
  let machinomy = new Machinomy(sender, web3, {engine: 'nedb', databaseFile:'clientDB'})
  let checkBalanceERC20 = async (message: string, web3: Web3, sender: string, cb: Function) => {
    let instanceERC20 = await buildCPUContract(process.env.ERC20CONTRACT_ADDRESS as string, web3)
    let deployedERC20 = await instanceERC20.deployed()
    console.log('----------')
    console.log(message)
    let balanceBefore = (await deployedERC20.balanceOf(sender)).toNumber()
    console.log('Balance before', balanceBefore.toString())
    let result = await cb()
    let balanceAfter = (await deployedERC20.balanceOf(sender)).toNumber()
    console.log('Balance after', balanceAfter.toString())
    let diff = balanceAfter - balanceBefore
    console.log('Diff', diff.toString())
    return result
  }

  let message = 'This is first buy:'
  let resultFirstERC20 = await checkBalanceERC20(message, web3, sender, async () => {
    return await machinomy.buy({
      receiver: receiver,
      price: 1,
      gateway: 'http://localhost:3001/machinomy',
      meta: 'metaidexample',
      minimumDepositAmount: 100
    }).catch((e: Error) => {
      console.log(e)
    })
  })

  message = 'This is second buy:'
  let resultSecondERC20 = await checkBalanceERC20(message, web3, sender, async () => {
    return await machinomy.buy({
      receiver: receiver,
      price: 1,
      gateway: 'http://localhost:3001/machinomy',
      meta: 'metaidexample',
      minimumDepositAmount: 100
    }).catch((e: Error) => {
      console.log(e)
    })
  })

  let channelIdERC20 = resultSecondERC20.channelId
  message = 'Deposit:'
  await checkBalanceERC20(message, web3, sender, async () => {
    await machinomy.deposit(channelIdERC20, 10)
  })

  message = 'Once more buy'
  let resultThirdERC20 = await checkBalanceERC20(message, web3, sender, async () => {
    return await machinomy.buy({
      receiver: receiver,
      price: 1,
      gateway: 'http://localhost:3001/machinomy',
      meta: 'metaidexample',
      minimumDepositAmount: 100
    }).catch((e: Error) => {
      console.log(e)
    })
  })

  message = 'Claim by reciever'
  await checkBalanceERC20(message, web3, sender, async () => {
    // let machinomy2 = new Machinomy(receiver, web3, { engine: 'mongo' })
    await machinomyHub.close(resultThirdERC20.channelId, "0xc2a3498f52c9f8f6efd210f4153bdc71685c0e52")
  })
}

f().catch((error) => {
  console.log(error)
  server.close()
  try { fs.unlinkSync('clientDB') } catch (error) { console.log(error) }
  try { fs.unlinkSync('serverDB') } catch (error) { console.log(error) }
})
