import * as configuration from '../lib/configuration'
import Web3 = require('web3')
import Machinomy from '../index'
import * as express from 'express'
import * as bodyParser from 'body-parser'
const fs = require('fs')

let sender = '0x4bdcca2d324ebf8c7fbd3d092a9f001f40936981'
let receiver = '0x36403b09306302562e6f7679f77bf08f7cb29e20'

process.env.CONTRACT_ADDRESS = "0x15d06f6eaaa32300053e477f919c76f9f5da82ba"
let getBalance = async (web3: Web3, account: string) => {
  return web3.eth.getBalance(account)
}

let provider = configuration.currentProvider()
let web3 = new Web3(provider)
// const provider = new Web3.providers.HttpProvider('http://localhost:8545')
// const web3 = new Web3(provider)

let machinomyHub = new Machinomy(receiver, web3, { databaseUrl: 'nedb://./hub' })
let hub = express()
hub.use(bodyParser.json())
hub.use(bodyParser.urlencoded({ extended: false }))
hub.post('/machinomy', async (req: express.Request, res: express.Response, next: Function) => {
  let body = await machinomyHub.acceptPayment(req.body)
  res.status(200).send(body)
})

let checkBalance = async (message: string, web3: Web3, sender: string, cb: Function) => {
  console.log('----------')
  console.log(message)
  let balanceBefore = await getBalance(web3, sender)
  console.log('Balance before', web3.fromWei(balanceBefore, 'mwei').toString())
  let result = await cb()
  let balanceAfter = await getBalance(web3, sender)
  console.log('Balance after', web3.fromWei(balanceAfter, 'mwei').toString())
  let diff = balanceBefore.minus(balanceAfter)
  console.log('Diff', web3.fromWei(diff, 'mwei').toString())
  return result
}

let port = 3001
let server = hub.listen(port, async () => {
  const price = 100

  let machinomy = new Machinomy(sender, web3, { settlementPeriod: 0, databaseUrl: 'nedb://./client' })

  let message = 'This is first buy:'
  let resultFirst = await checkBalance(message, web3, sender, async () => {
    return machinomy.buy({
      receiver: receiver,
      price: price,
      gateway: 'http://localhost:3001/machinomy',
      meta: 'metaexample',
      minimumDepositAmount: 10000
    }).catch((e: Error) => {
      console.log(e)
    })
  })

  message = 'This is second buy:'
  let resultSecond = await checkBalance(message, web3, sender, async () => {
    return machinomy.buy({
      receiver: receiver,
      price: price,
      gateway: 'http://localhost:3001/machinomy',
      meta: 'metaexample',
      minimumDepositAmount: 10000
    }).catch((e: Error) => {
      console.log(e)
    })
  })

  let channelId = resultSecond.channelId
  message = 'Deposit:'
  await checkBalance(message, web3, sender, async () => {
    await machinomy.deposit(channelId, price)
  })

  message = 'First close:'
  await checkBalance(message, web3, sender, async () => {
    await machinomy.close(channelId)
  })

  message = 'Second close:'
  await checkBalance(message, web3, sender, async () => {
    await machinomy.close(channelId)
  })

  message = 'Once more buy'
  let resultThird = await checkBalance(message, web3, sender, async () => {
    return machinomy.buy({
      receiver: receiver,
      price: price,
      gateway: 'http://localhost:3001/machinomy',
      meta: 'metaexample',
      minimumDepositAmount: 10000
    }).catch((e: Error) => {
      console.log(e)
    })
  })

  message = 'Claim by reciever'
  await checkBalance(message, web3, sender, async () => {
    await machinomyHub.close(resultThird.channelId,"0xc2a3498f52c9f8f6efd210f4153bdc71685c0e52")
  })

  console.log('ChannelId after first buy:', resultFirst.channelId)
  console.log('ChannelId after second buy:', resultSecond.channelId)
  console.log('ChannelId after once more buy:', resultThird.channelId)

  server.close()
  try { fs.unlinkSync('clientDB') } catch (error) { console.log(error) }
  try { fs.unlinkSync('serverDB') } catch (error) { console.log(error) }
})
