import { configHelperNetworks } from '@oceanprotocol/lib'
import Web3 from 'web3'

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
  web3 = new Web3(process.env.NODE_URI || configHelperNetworks[1].nodeUri)
}


const connectWallet = async (): Promise<any> => {

  if (typeof window === 'undefined')
    return Promise.resolve();

  if (window.ethereum) {
    window.web3 = new Web3(window.ethereum)
    try {
      // Request account access if needed
      await window.ethereum.enable()
      return Promise.resolve()
    } catch (error) {
      return Promise.reject(error)
    }
  }
  // Legacy dapp browsers...
  else if (window.web3) {
    window.web3 = new Web3(web3.currentProvider)
    return Promise.resolve()
  }
  // Non-dapp browsers...
  else {
    return Promise.reject('Non-Ethereum browser detected. You should consider trying MetaMask!')
  }

};

export { connectWallet, web3 }
