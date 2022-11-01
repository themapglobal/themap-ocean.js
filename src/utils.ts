import { web3 } from './web3'

export const getCurrentAccount = async (): Promise<string> => {
  const accounts = await web3.eth.getAccounts()
  return accounts[0]
}

export const isValidAddress = (address: string): Boolean => {

  return /^0x[a-fA-F0-9]{40}$/.test(address);

}