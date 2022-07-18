import {
  NftFactory,
  NftCreateData,
  configHelperNetworks,
  ConfigHelper,
  Config
} from '@oceanprotocol/lib'
import Web3 from 'web3';
import fs from 'fs'
import { homedir } from 'os'

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

export class Node {

}

export class NodeFactory {
  private web3: Web3
  private config: Config
  private addresses: any
  private factory: NftFactory

  constructor(
    nodeUri?: string,
    nftFactoryAddres?: string,
    network?: string | number,
    config?: Config
  ) {
    this.web3 = new Web3(nodeUri || configHelperNetworks[1].nodeUri)
    this.config = config || new ConfigHelper().getConfig(network || 'unknown')
    this.addresses = getAddresses()

    this.factory = new NftFactory(
      nftFactoryAddres || this.addresses.ERC721Factory,
      this.web3,
      network,
      null,
      this.config
    )
  }

  public async newGoal(name: string, account: string): Promise<Node> {
    const symbol = `GOAL${this.randomNumber()}`
    return this.newNode(symbol, name, account)
  }

  public async newProject(name: string, account: string): Promise<Node> {
    const symbol = `PROJ${this.randomNumber()}`
    return this.newNode(symbol, name, account)
  }

  private async newNode(symbol: string, name: string, account: string): Promise<Node> {
    const nftParamsAsset: NftCreateData = {
      name: name,
      symbol: symbol,
      templateIndex: 1,
      tokenURI: 'https://oceanprotocol.com/nft/',
      transferable: true,
      owner: account
    }

    this.factory.createNFT(account, nftParamsAsset)

    const node = new Node()
    return node
    // node = Node()
    // https://stackoverflow.com/questions/60920784/python-how-to-convert-an-existing-parent-class-object-to-child-class-object
    // node.__dict__.update(data_nft.__dict__)
    // node.setData(INBOUND_KEY, " ", wallet)
    // node.setData(OUTBOUND_KEY, " ", wallet)
    // return node
  }

  private randomNumber(): string {
    const random = Math.floor(Math.random() * 9999)
    return String(random).padStart(4, '0');
  }
}
