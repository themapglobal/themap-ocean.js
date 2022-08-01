import { web3 } from './web3'

export const getCurrentAccount = async (): Promise<string> => {
  const accounts = await web3.eth.getAccounts()
  return accounts[0]
}
