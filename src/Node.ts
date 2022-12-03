import {
  Aquarius,
  Config,
  ConfigHelper,
  getHash,
  Nft,
  ProviderInstance,
  setContractDefaults
} from "@oceanprotocol/lib";
import Web3 from 'web3'
import { getCurrentAccount, isValidAddress } from './utils'
import { web3 } from "./web3";

export class Node extends Nft {

  public nftAddress: string
  public id: string
  public metadata: object

  constructor(
    nftAddress: string,
    web3: Web3,
    network?: string | number,
    config?: Config,
    id?: string,
    metadata?: object
  ) {

    super(web3, network, null, config)
    this.nftAddress = nftAddress
    this.id = id
    this.metadata = metadata

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

  public addInboundAddress(newAddress: string) {
    return this._addEdge("in", newAddress)
  }

  public addOutboundAddress(newAddress: string) {
    return this._addEdge("out", newAddress)
  }

  private _addEdge(type: string, newAddress: string) {

    if(!isValidAddress(newAddress))
      return;

    if(newAddress === this.nftAddress)
      return;


    if(type === 'in') {

      const inboundAddrs = this._getInboundAddress();
      if(inboundAddrs.indexOf(newAddress) >= 0)
        return;

      inboundAddrs.push(newAddress);
      this.metadata['additionalInformation'].inbound_addrs = inboundAddrs.join(" ");

    }

    else if(type === 'out') {

      const outboundAddrs = this._getOutboundAddress();
      if(outboundAddrs.indexOf(newAddress) >= 0)
        return;

      outboundAddrs.push(newAddress);
      this.metadata['additionalInformation'].outbound_addrs = outboundAddrs.join(" ");

    }

  }

  public async resetInboundAddress() {
    this.metadata['additionalInformation'].inbound_addrs = "";
  }

  public async resetOutboundAddress() {
    this.metadata['additionalInformation'].outbound_addrs = "";
  }

  public async pushToAquarius(): Promise<Node> {

    const chainId: number = await web3.eth.getChainId()
    const config: Config = new ConfigHelper().getConfig(chainId)
    const account = await getCurrentAccount()

    const aquarius = new Aquarius(config.metadataCacheUri)
    const ddo = await aquarius.resolve(this.id);

    ddo.metadata['additionalInformation'] = this.metadata['additionalInformation'];
    ddo.metadata['description'] = this.metadata['description'];

    const encryptedResponse = await ProviderInstance.encrypt(ddo, config.providerUri)

    const nft: Nft = new Nft(web3)
    await nft.setMetadata(
      this.nftAddress,
      account,
      0,
      config.providerUri,
      '',
      '0x2',
      encryptedResponse,
      '0x' + getHash(JSON.stringify(ddo))
    )

    //TODO: This is not waiting for the true cache update
    await aquarius.waitForAqua(ddo.id);

    return this;

  }

  private _getInboundAddress(): Array<string> {
    return this.metadata['additionalInformation'].inbound_addrs ? this.metadata['additionalInformation'].inbound_addrs.split(" ") : []
  }

  private _getOutboundAddress(): Array<string> {
    return this.metadata['additionalInformation'].outbound_addrs ? this.metadata['additionalInformation'].outbound_addrs.split(" ") : []
  }

}