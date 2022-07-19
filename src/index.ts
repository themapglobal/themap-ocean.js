import {
  transfer,
  configHelperNetworks,
  ConfigHelper
} from '@oceanprotocol/lib'
import Web3 from 'web3';
import fs from 'fs'
import { homedir } from 'os'
import { INBOUND_KEY, NodeFactory, OUTBOUND_KEY } from './themap';

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
  
  // create new nodes using the node factory
  const nodeFactory = new NodeFactory(addresses.ERC721Factory, config)

  console.log('------------------------------------------------')
  const goalPyWasm = await nodeFactory.newGoal('Py run on WASM', publisherAccount)
  console.log(`goal.symbol: ${await goalPyWasm.symbol()}`)
  console.log(`goal.name: ${await goalPyWasm.name()}`)
  console.log(`goal.address: ${goalPyWasm.nftAddress}`)
  console.log(`goal.${INBOUND_KEY}: ${await goalPyWasm.getNodeData(INBOUND_KEY)}`)
  console.log(`goal.${OUTBOUND_KEY}: ${await goalPyWasm.getNodeData(OUTBOUND_KEY)}`)

  console.log('------------------------------------------------')
  const goalPyBrowser = await nodeFactory.newGoal('Py run in browser', publisherAccount)
  await goalPyBrowser.addInboundNode(publisherAccount, goalPyWasm)
  console.log(`goal.symbol: ${await goalPyBrowser.symbol()}`)
  console.log(`goal.name: ${await goalPyBrowser.name()}`)
  console.log(`goal.address: ${goalPyBrowser.nftAddress}`)
  console.log(`goal.${INBOUND_KEY}: ${await goalPyBrowser.getNodeData(INBOUND_KEY)}`)
  console.log(`goal.${OUTBOUND_KEY}: ${await goalPyBrowser.getNodeData(OUTBOUND_KEY)}`)

  console.log('------------------------------------------------')
  const projectX = await nodeFactory.newProject('Proj.: X', publisherAccount)
  await projectX.addOutboundNode(publisherAccount, goalPyBrowser)
  console.log(`project.symbol: ${await projectX.symbol()}`)
  console.log(`project.name: ${await projectX.name()}`)
  console.log(`project.address: ${projectX.nftAddress}`)
  console.log(`project.${INBOUND_KEY}: ${await projectX.getNodeData(INBOUND_KEY)}`)
  console.log(`project.${OUTBOUND_KEY}: ${await projectX.getNodeData(OUTBOUND_KEY)}`)

  console.log('------------------------------------------------')
  const projectY = await nodeFactory.newProject('Proj.: Y', publisherAccount)
  await projectY.addOutboundNode(publisherAccount, goalPyBrowser)
  console.log(`project.symbol: ${await projectY.symbol()}`)
  console.log(`project.name: ${await projectY.name()}`)
  console.log(`project.address: ${projectY.nftAddress}`)
  console.log(`project.${INBOUND_KEY}: ${await projectY.getNodeData(INBOUND_KEY)}`)
  console.log(`project.${OUTBOUND_KEY}: ${await projectY.getNodeData(OUTBOUND_KEY)}`)

  console.log('------------------------------------------------')
  const projectPyscript = await nodeFactory.newProject('Project: Pyscript', publisherAccount)
  await projectPyscript.addInboundNode(publisherAccount, goalPyWasm)
  await projectPyscript.addOutboundNode(publisherAccount, goalPyBrowser)
  await projectPyscript.addOutboundNode(publisherAccount, projectY)
  console.log(`project.symbol: ${await projectPyscript.symbol()}`)
  console.log(`project.name: ${await projectPyscript.name()}`)
  console.log(`project.address: ${projectPyscript.nftAddress}`)
  console.log(`project.${INBOUND_KEY}: ${await projectPyscript.getNodeData(INBOUND_KEY)}`)
  console.log(`project.${OUTBOUND_KEY}: ${await projectPyscript.getNodeData(OUTBOUND_KEY)}`)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  });
