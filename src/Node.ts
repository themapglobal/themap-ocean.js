import { Config, Nft, setContractDefaults } from '@oceanprotocol/lib'
import Web3 from 'web3'

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

  public async addInboundNode(account: string, node: Node): Promise<void> {
    await this.addInboundAddr(account, node.nftAddress)
  }

  public async addInboundAddr(account: string, nodeAddress: string): Promise<void> {
    await this._addAddr(account, INBOUND_KEY, nodeAddress)
  }

  // ==== outbounds ====

  public async getOutboundAddrs(): Promise<string[]> {
    return await this._getAddrs(OUTBOUND_KEY)
  }

  public async addOutboundNode(account: string, node: Node): Promise<void> {
    await this.addOutboundAddr(account, node.nftAddress)
  }

  public async addOutboundAddr(account: string, nodeAddress: string): Promise<void> {
    await this._addAddr(account, OUTBOUND_KEY, nodeAddress)
  }

  // ==== helpers ====

  public async _getAddrs(key: string): Promise<string[]> {
    const s = await this.getNodeData(key)
    return s.split(' ')
  }

  public async _addAddr(account: string, key: string, value: string): Promise<void> {
    const s = await this.getNodeData(key)
    if (s.includes(value)) {
      throw new Error(`${value} already exists in ${key}`)
    }
    await this.setNodeData(account, key, `${s} ${value}`)
  }

  public async setNodeData(account: string, key: string, value: string): Promise<void> {
    await this.setData(this.nftAddress, account, key, value)
  }

  public async getNodeData(key: string): Promise<string> {
    return await this.getData(this.nftAddress, key)
  }
}
