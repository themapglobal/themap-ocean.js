import { configHelperNetworks } from '@oceanprotocol/lib'
import Web3 from 'web3'
import { config as dotenvConfig } from 'dotenv'
import { resolve } from 'path'
dotenvConfig({ path: resolve(__dirname, '../.env') })

let web3: Web3

declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    web3?: any
    ethereum?: any
  }
}

if (typeof window !== 'undefined' && window.web3) {
  web3 = new Web3(window.web3.currentProvider)
} else {
  // if we are not in the browser, or the user is not running metamask
  console.log(resolve(__dirname, '../.env'))
  console.log(process.env.NODE_URI)
  console.log(configHelperNetworks[1].nodeUri)
  web3 = new Web3(process.env.NODE_URI || configHelperNetworks[1].nodeUri)
}

/*
https://medium.com/@parag.chirde/building-a-dapp-on-ethereum-with-vuejs-and-solidity-d01a24b54c1f

https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
 */
if (typeof window !== 'undefined') {
  window.addEventListener('load', async () => {
    // Modern dapp browsers...
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      try {
        // Request account access if needed
        await window.ethereum.enable()
      } catch (error) {
        alert('User denied account access...')
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      window.web3 = new Web3(web3.currentProvider)
    }
    // Non-dapp browsers...
    else {
      alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  })
}

export { web3 }
