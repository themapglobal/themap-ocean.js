import {
  Aquarius,
  Config,
  ConfigHelper,
  DDO,
  generateDid,
  Nft,
  NftFactory,
  ProviderInstance
} from '@oceanprotocol/lib'
import { INBOUND_KEY, Node, OUTBOUND_KEY } from './Node'
import { getCurrentAccount } from './utils'
import { web3 } from './web3'

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
    const factory: NftFactory = new NftFactory(config.erc721FactoryAddress, web3)
    // get Metamask account
    const account: string = await getCurrentAccount()

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

    // encrypt ddo with provider service
    console.log(`Provider service URL: ${config.providerUri}`)
    const providerResponse = await ProviderInstance.encrypt(ddo, config.providerUri)
    const encryptedResponse = await providerResponse

    // validate ddo with aquarius service
    console.log(`Aquarius service URL: ${config.metadataCacheUri}`)
    const aquarius = new Aquarius(config.metadataCacheUri)
    const validateResult = await aquarius.validate(ddo)
    if (!validateResult.valid) {
      throw new Error('Could not validate metadata')
    }

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
      validateResult.hash // '0x' + getHash(JSON.stringify(ddo))
    )

    // const aquarius = new Aquarius(config.metadataCacheUri)
    const resolvedDDO = await aquarius.waitForAqua(ddo.id)
    console.log(resolvedDDO)

    const node = new Node(nftAddress, web3, chainId, config)
    await node.setNodeData(account, INBOUND_KEY, '')
    await node.setNodeData(account, OUTBOUND_KEY, '')
    return node
  }

  private _randomNumber(): string {
    const random = Math.floor(Math.random() * 9999)
    return String(random).padStart(4, '0')
  }
}
