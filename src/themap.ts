import {
  NftFactory,
  NftCreateData,
  configHelperNetworks,
  ConfigHelper,
  Config,
  Nft
} from '@oceanprotocol/lib'
import Web3 from 'web3';

const INBOUND_KEY = 'inbound_addrs'
const OUTBOUND_KEY = 'outbound_addrs'

export class Node extends Nft {

}

export class NodeFactory {
  private web3: Web3
  private config: Config
  private factory: NftFactory

  constructor(
    nftFactoryAddres: string,
    config?: Config,
    nodeUri?: string,
    network?: string | number
  ) {
    this.web3 = new Web3(nodeUri || configHelperNetworks[1].nodeUri)
    this.config = config || new ConfigHelper().getConfig(network || 'unknown')

    this.factory = new NftFactory(
      nftFactoryAddres,
      this.web3,
      network,
      null,
      this.config
    )
  }

  public async newGoal(name: string, account: string): Promise<string> {
    const symbol = `GOAL-${this.randomNumber()}`
    console.log(symbol)
    return this.newNode(symbol, name, account)
  }

  public async newProject(name: string, account: string): Promise<string> {
    const symbol = `PROJ-${this.randomNumber()}`
    console.log(symbol)
    return this.newNode(symbol, name, account)
  }

  private async newNode(symbol: string, name: string, account: string): Promise<string> {
    const nftParamsAsset: NftCreateData = {
      name: name,
      symbol: symbol,
      templateIndex: 1,
      tokenURI: 'https://oceanprotocol.com/nft/',
      transferable: true,
      owner: account
    }

    const nftAddress = await this.factory.createNFT(account, nftParamsAsset)

    return nftAddress
    /* const node = new Node(this.web3, this.network, null, this.config)
    node.setNftAddress(nftAddress)
    node.setData(account, INBOUND_KEY, " ")
    node.setData(account, OUTBOUND_KEY, " ")
    return node */
  }

  private randomNumber(): string {
    const random = Math.floor(Math.random() * 9999)
    return String(random).padStart(4, '0');
  }
}
