import {
  Config,
  ProviderInstance,
  Aquarius,
  NftFactory,
  NftCreateData,
  Datatoken,
  Nft,
  ZERO_ADDRESS,
  Erc20CreateParams,
  Files,
  transfer,
  ComputeAsset,
  ComputeAlgorithm,
  ComputeJob,
  sleep,
  ProviderComputeInitialize,
  ConsumeMarketFee,
  approveWei,
  configHelperNetworks,
  ConfigHelper
} from '@oceanprotocol/lib'
import Web3 from 'web3';

const web3 = new Web3(process.env.NODE_URI || configHelperNetworks[1].nodeUri)

const getTestConfig = async (web3: Web3) => {
  const config = new ConfigHelper().getConfig(await web3.eth.getChainId())
  config.providerUri = process.env.PROVIDER_URL || config.providerUri
  return config
}

/**
 * main function
 */
async function main() {
  const config = await getTestConfig(web3)
  const aquarius = new Aquarius(config.metadataCacheUri)
  const providerUrl = config.providerUri

  console.log(`Aquarius URL: ${config.metadataCacheUri}`)
  console.log(`Provider URL: ${providerUrl}`)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  });
