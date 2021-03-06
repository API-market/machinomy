
import Web3 = require('web3')
import Machinomy from '../index'

let f = (async () => {
  let fetch = require('whatwg-fetch').fetch
  /**
   * Account that send payments payments.
   */
  let sender = '0xbb1891ca1f43bdcec4f2d47d68c9c27023ac3ffd'

  /**
   * Geth must be run on local machine, or use another web3 provider.
   */
  let provider = new Web3.providers.HttpProvider('http://localhost:8545')
  let web3 = new Web3(provider)

  /**
   * Create machinomy instance that provides API for accepting payments.
   */
  let machinomy = new Machinomy(sender, web3, { settlementPeriod: 0, databaseUrl: 'nedb://./client' })

  let response = await fetch('http://localhost:3000/content')
  let headers = response.headers.map

  /**
   * Request token to content access
   */
  let result = await machinomy.buy({
    price: 0.1,
    minimumDepositAmount: 1000,
    gateway: "http://localhost:3002/machinomy",
    receiver: "0x27efff7cfe5e744852e71209884ceb1b699f5e36",
    meta: 'metaidexample'
    
  })

  let token = result.token

  /**
   * Request paid content
   */
  let content = await fetch('http://localhost:3000/content', {
    headers: {
      authorization: `paywall ${token}`
    }
  })

  console.log(content._bodyText)
})

f().then().catch((e) => {
  console.log(e)
})
