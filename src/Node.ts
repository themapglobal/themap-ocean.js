import { Config, Nft, setContractDefaults } from '@oceanprotocol/lib'
import Web3 from 'web3'
import { getCurrentAccount } from './utils'

export const INBOUND_KEY = 'inbound_addrs'
export const OUTBOUND_KEY = 'outbound_addrs'

export class Node extends Nft {
  public nftAddress: string
  public id: string
  public description: string

  constructor(
    nftAddress: string,
    web3: Web3,
    network?: string | number,
    config?: Config,
    id?: string,
    description?: string
  ) {
    super(web3, network, null, config)
    this.nftAddress = nftAddress
    this.id = id
    this.description = description
  }

  public async initialize(): Promise<void> {
    await this.setNodeData(INBOUND_KEY, '')
    await this.setNodeData(OUTBOUND_KEY, '')
  }

  public async name(): Promise<string> {
    const nftContract = setContractDefaults(
      new this.web3.eth.Contract(this.nftAbi, this.nftAddress),
      this.config
    )
    return await nftContract.methods.name().call()
  }

  public async symbol(): Promise<string> {
    const nftContract = setContractDefaults(
      new this.web3.eth.Contract(this.nftAbi, this.nftAddress),
      this.config
    )
    return await nftContract.methods.symbol().call()
  }

  // ==== inbounds ====

  public async getInboundAddrs(): Promise<string[]> {
    return await this._getAddrs(INBOUND_KEY)
  }

  public async addInboundNode(node: Node): Promise<void> {
    await this.addInboundAddr(node.nftAddress)
  }

  public async addInboundAddr(nodeAddress: string): Promise<void> {
    await this._addAddr(INBOUND_KEY, nodeAddress)
  }

  // ==== outbounds ====

  public async getOutboundAddrs(): Promise<string[]> {
    return await this._getAddrs(OUTBOUND_KEY)
  }

  public async addOutboundNode(node: Node): Promise<void> {
    await this.addOutboundAddr(node.nftAddress)
  }

  public async addOutboundAddr(nodeAddress: string): Promise<void> {
    await this._addAddr(OUTBOUND_KEY, nodeAddress)
  }

  // ==== helpers ====

  private async _getAddrs(key: string): Promise<string[]> {
    const s = await this.getNodeData(key)
    return s.split(' ')
  }

  private async _addAddr(key: string, value: string): Promise<void> {
    const s = await this.getNodeData(key)
    if (s.includes(value)) {
      throw new Error(`${value} already exists in ${key}`)
    }
    await this.setNodeData(key, `${s} ${value}`)
  }

  public async setNodeData(key: string, value: string): Promise<void> {
    // get Metamask account
    const account = await getCurrentAccount()

    await this.setData(this.nftAddress, account, key, value)
  }

  public async getNodeData(key: string): Promise<string> {
    return await this.getData(this.nftAddress, key)
  }
}