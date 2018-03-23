import * as configuration from '../lib/configuration'
import Web3 = require('web3')
import Machinomy from '../index'
import * as express from 'express'
import Payment from '../lib/Payment'
import * as bodyParser from 'body-parser'
import { buildCPUContract } from '@machinomy/contracts'

const fs = require('fs')
let sender = '0x3f3f4872514d37b00b647225b045da5ea9d6ab43'
let receiver = '0xa705d045d8afde3514552297315c7d03b9fe8ddb'

process.env.CONTRACT_ADDRESS = "0x9c4878be04d1295ea266181469ce94a983bbf975"
process.env.ERC20CONTRACT_ADDRESS = "0xb8972592dc94e4127ce821dd6e7b104adde78ad4"
const provider = new Web3.providers.HttpProvider('http://localhost:8545')
const web3 = new Web3(provider)

let machinomyHub = new Machinomy(receiver, web3, { databaseUrl: 'mongodb://localhost:27017/machinomy' })

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
  let machinomy = new Machinomy(sender, web3, { databaseUrl: 'nedb://./client' })
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
    await machinomyHub.close(resultThirdERC20.channelId, "0x0ed1bb8d445e16973f8bc88cd5fd5b9034ca0429")
  })
}

f().catch((error) => {
  console.log(error)
  server.close()
  try { fs.unlinkSync('clientDB') } catch (error) { console.log(error) }
  try { fs.unlinkSync('serverDB') } catch (error) { console.log(error) }
})
