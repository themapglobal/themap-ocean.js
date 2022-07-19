import {
  transfer,
  configHelperNetworks,
  ConfigHelper
} from '@oceanprotocol/lib'
import Web3 from 'web3';
import fs from 'fs'
import { homedir } from 'os'
import { NodeFactory } from './themap';

const web3 = new Web3(process.env.NODE_URI || configHelperNetworks[1].nodeUri)

const getTestConfig = async (web3: Web3) => {
  const config = new ConfigHelper().getConfig(await web3.eth.getChainId())
  config.providerUri = process.env.PROVIDER_URL || config.providerUri
  return config
}

const getAddresses = () => {
  const data = JSON.parse(
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.readFileSync(
      process.env.ADDRESS_FILE ||
        `${homedir}/.ocean/ocean-contracts/artifacts/address.json`,
      'utf8'
    )
  )
  return data.development
}

/**
 * main function
 */
async function main() {
  // load the configuration
  const config = await getTestConfig(web3)

  console.log(`Aquarius URL: ${config.metadataCacheUri}`)
  console.log(`Provider URL: ${config.providerUri}`)

  // initialize accounts
  const accounts = await web3.eth.getAccounts()
  const publisherAccount = accounts[0]
  const consumerAccount = accounts[1]

  console.log(`Publisher account address: ${publisherAccount}`)
  console.log(`Consumer account address: ${consumerAccount}`)

  // get the address of the deployed contracts
  const addresses = getAddresses()

  // send some OCEAN to consumer account
  transfer(web3, publisherAccount, addresses.Ocean, consumerAccount, '100')
  
  // create a new node using the node factory
  const nodeFactory = new NodeFactory(addresses.ERC721Factory, config)

  const goalAddress = await nodeFactory.newGoal('Test goal', publisherAccount)
  console.log(`Goal node address: ${goalAddress}`)

  const projectAddress = await nodeFactory.newProject('Test project', publisherAccount)
  console.log(`Project node address: ${projectAddress}`)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  });
