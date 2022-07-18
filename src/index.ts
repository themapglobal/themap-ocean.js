import {
  Aquarius,
  NftFactory,
  NftCreateData,
  ZERO_ADDRESS,
  Erc20CreateParams,
  transfer,
  configHelperNetworks,
  ConfigHelper
} from '@oceanprotocol/lib'
import Web3 from 'web3';
import fs from 'fs'
import { homedir } from 'os'

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
  const aquarius = new Aquarius(config.metadataCacheUri)
  const providerUrl = config.providerUri

  console.log(`Aquarius URL: ${config.metadataCacheUri}`)
  console.log(`Provider URL: ${providerUrl}`)

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

  // publish Data NFT and a Datatoken with a liquidity pool

  const factory = new NftFactory(addresses.ERC721Factory, web3)

  const nftParamsAsset: NftCreateData = {
    name: 'NAME',
    symbol: 'SYMBOL',
    templateIndex: 1,
    tokenURI: 'aaa',
    transferable: true,
    owner: publisherAccount
  }
  const erc20ParamsAsset: Erc20CreateParams = {
    templateIndex: 1,
    cap: '100000',
    feeAmount: '0',
    paymentCollector: ZERO_ADDRESS,
    feeToken: ZERO_ADDRESS,
    minter: publisherAccount,
    mpFeeAddress: ZERO_ADDRESS
  }

  const tx = await factory.createNftWithErc20(publisherAccount, nftParamsAsset, erc20ParamsAsset)

  const nftAddress = tx.events.NFTCreated.returnValues[0]
  const datatokenAddress = tx.events.TokenCreated.returnValues[0]

  
  console.log(`NFT address: ${nftAddress}`)
  console.log(`Datatoken address: ${datatokenAddress}`)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  });
