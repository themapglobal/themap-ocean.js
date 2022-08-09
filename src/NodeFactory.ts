import {
  Aquarius,
  Config,
  ConfigHelper,
  DDO,
  generateDid,
  getHash,
  Nft,
  NftFactory,
  ProviderInstance
} from '@oceanprotocol/lib'
import fs from 'fs'
import { homedir } from 'os'
import { Node } from './Node'
import { getCurrentAccount } from './utils'
import { web3 } from './web3'

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

export class NodeFactory {
  public async newGoal(name: string): Promise<Node> {
    const symbol = `GOAL-${this._randomNumber()}`
    return this._newNode(symbol, name)
  }

  public async newProject(name: string): Promise<Node> {
    const symbol = `PROJ-${this._randomNumber()}`
    return this._newNode(symbol, name)
  }

  private async _newNode(symbol: string, name: string): Promise<Node> {
    const chainId: number = await web3.eth.getChainId()
    const config: Config = new ConfigHelper().getConfig(chainId)
    const factory: NftFactory = new NftFactory(
      config.erc721FactoryAddress || getAddresses().ERC721Factory,
      web3
    )
    // get Metamask account
    const account = await getCurrentAccount()

    // create new nft
    const nftParamsAsset = {
      name,
      symbol,
      templateIndex: 1,
      tokenURI: 'https://oceanprotocol.com/nft/',
      transferable: true,
      owner: account
    }
    const nftAddress = await factory.createNFT(account, nftParamsAsset)

    const ddo = this._getDdoData(chainId, nftAddress, symbol, name)

    // encrypt ddo with provider service
    // config.providerUri = 'http://127.0.0.:8030'
    console.log(`Provider service URL: ${config.providerUri}`)
    const providerResponse = await ProviderInstance.encrypt(ddo, config.providerUri)
    const encryptedResponse = await providerResponse

    // set ddo metadata on nft
    const nft: Nft = new Nft(web3)
    await nft.setMetadata(
      nftAddress,
      account,
      0,
      config.providerUri,
      '',
      '0x2',
      encryptedResponse,
      '0x' + getHash(JSON.stringify(ddo))
    )

    console.log(`Aquarius service URL: ${config.metadataCacheUri}`)
    const aquarius = new Aquarius(config.metadataCacheUri)
    const resolvedDDO = await aquarius.waitForAqua(ddo.id)
    console.log(resolvedDDO)

    const node = new Node(nftAddress, web3, chainId, config)
    await node.initialize()
    return node
  }

  private _getDdoData(
    chainId: number,
    nftAddress: string,
    symbol: string,
    name: string
  ): DDO {
    // set ddo metadata
    const ddo: DDO = {
      '@context': ['https://w3id.org/did/v1'],
      id: generateDid(nftAddress, chainId),
      nftAddress,
      version: '4.1.0',
      chainId,
      metadata: {
        created: new Date().toISOString().replace(/\.[0-9]{3}Z/, 'Z'),
        updated: new Date().toISOString().replace(/\.[0-9]{3}Z/, 'Z'),
        type: 'dataset',
        name: symbol,
        description: name,
        tags: ['themap'],
        author: 'TheMap',
        license: 'https://market.oceanprotocol.com/terms'
      },
      services: [
        {
          id: 'testFakeId',
          type: 'access',
          files: '',
          datatokenAddress: '0x0',
          serviceEndpoint: 'https://v4.provider.rinkeby.oceanprotocol.com',
          timeout: 0
        }
      ]
    }
    console.log(ddo)
    return ddo
  }

  private _randomNumber(): string {
    const random = Math.floor(Math.random() * 9999)
    return String(random).padStart(4, '0')
  }
}
