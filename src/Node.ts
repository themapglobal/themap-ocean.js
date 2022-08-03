import { Config, Nft, setContractDefaults } from '@oceanprotocol/lib'
import Web3 from 'web3'
import { getCurrentAccount } from './utils'

export const INBOUND_KEY = 'inbound_addrs'
export const OUTBOUND_KEY = 'outbound_addrs'

export class Node extends Nft {
  public nftAddress: string

  constructor(
    nftAddress: string,
    web3: Web3,
    network?: string | number,
    config?: Config
  ) {
    super(web3, network, null, config)
    this.nftAddress = nftAddress
  }

  public async initialize(): Promise<void> {
    await this._setNodeData(INBOUND_KEY, '')
    await this._setNodeData(OUTBOUND_KEY, '')
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
    const s = await this._getNodeData(key)
    return s.split(' ')
  }

  private async _addAddr(key: string, value: string): Promise<void> {
    const s = await this._getNodeData(key)
    if (s.includes(value)) {
      throw new Error(`${value} already exists in ${key}`)
    }
    await this._setNodeData(key, `${s} ${value}`)
  }

  private async _setNodeData(key: string, value: string): Promise<void> {
    // get Metamask account
    const account = await getCurrentAccount()

    await this.setData(this.nftAddress, account, key, value)
  }

  private async _getNodeData(key: string): Promise<string> {
    return await this.getData(this.nftAddress, key)
  }
}
