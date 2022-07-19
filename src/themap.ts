import {
  NftFactory,
  NftCreateData,
  configHelperNetworks,
  ConfigHelper,
  Config,
  Nft
} from '@oceanprotocol/lib'
import { AbiItem } from 'web3-utils';
import Web3 from 'web3';

export const INBOUND_KEY = 'inbound_addrs'
export const OUTBOUND_KEY = 'outbound_addrs'

export class Node extends Nft {
  public nftAddress: string

  constructor(
    nftAddress: string,
    web3: Web3,
    network?: string | number,
    nftAbi?: AbiItem | AbiItem[],
    config?: Config
  ) {
    super(web3, network, nftAbi, config)
    this.nftAddress = nftAddress
  }
  /*  #==== inbounds
  def getInboundNodes(self) -> List[str]:
      return self._getNodes(INBOUND_KEY)

  def getInboundAddrs(self) -> List[str]:
      return self._getAddrs(INBOUND_KEY)

  def addInboundNode(self, node, wallet):
      self.addInboundAddr(node.address, wallet)
      
  def addInboundAddr(self, node_address:str, wallet):
      self._addAddr(INBOUND_KEY, node_address, wallet)
      
  #==== outbounds
  def getOutboundNodes(self) -> List[str]:
      return self._getNodes(OUTBOUND_KEY)

  def getOutboundAddrs(self) -> List[str]:
      return self._getAddrs(OUTBOUND_KEY)

  def addOutboundNode(self, node, wallet):
      self.addOutboundAddr(node.address, wallet)

  def addOutboundAddr(self, node_address:str, wallet):
      self._addAddr(OUTBOUND_KEY, node_address, wallet)
      
  #==== helpers
  def _getNodes(self, key:str) -> List[str]:
      return [nodeAt(addr, self.web3) for addr in self._getAddrs(key)]
      
  def _getAddrs(self, key:str) -> List[str]:
      return self.getData(key).split()

  def _addAddr(self, key:str, address:str, wallet):
      s = self.getData(key)
      assert address not in s
      self.setData(key, f"{s} {address}", wallet) 
 */
  public async setNodeData(account: string, key: string, value: string): Promise<void> {
    await this.setData(this.nftAddress, account, key, value)
  }

  public async getNodeData(key: string): Promise<string> {
    return await this.getData(this.nftAddress, key)
  }
}

export class NodeFactory {
  private web3: Web3
  private config: Config
  private network: string | number
  private factory: NftFactory

  constructor(
    nftFactoryAddres: string,
    config?: Config,
    nodeUri?: string,
    network?: string | number
  ) {
    this.web3 = new Web3(nodeUri || configHelperNetworks[1].nodeUri)
    this.config = config || new ConfigHelper().getConfig(network || 'unknown')
    this.network = network

    this.factory = new NftFactory(
      nftFactoryAddres,
      this.web3,
      network,
      null,
      this.config
    )
  }

  public async newGoal(name: string, account: string): Promise<Node> {
    const symbol = `GOAL-${this._randomNumber()}`
    console.log(symbol)
    return this._newNode(symbol, name, account)
  }

  public async newProject(name: string, account: string): Promise<Node> {
    const symbol = `PROJ-${this._randomNumber()}`
    console.log(symbol)
    return this._newNode(symbol, name, account)
  }

  private async _newNode(symbol: string, name: string, account: string): Promise<Node> {
    const nftParamsAsset: NftCreateData = {
      name: name,
      symbol: symbol,
      templateIndex: 1,
      tokenURI: 'https://oceanprotocol.com/nft/',
      transferable: true,
      owner: account
    }

    const nftAddress = await this.factory.createNFT(account, nftParamsAsset)

    const node = new Node(nftAddress, this.web3, this.network, null, this.config)
    await node.setNodeData(account, INBOUND_KEY, " ")
    await node.setNodeData(account, OUTBOUND_KEY, " ")
    return node
  }

  private _randomNumber(): string {
    const random = Math.floor(Math.random() * 9999)
    return String(random).padStart(4, '0');
  }
}
