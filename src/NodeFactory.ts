import {
  Config,
  ConfigHelper,
  Aquarius,
  DDO,
  DispenserCreationParams,
  Erc20CreateParams,
  generateDid,
  getHash,
  Nft,
  NftCreateData,
  NftFactory,
  ProviderInstance,
  ZERO_ADDRESS
} from '@oceanprotocol/lib'
import fs from 'fs'
import { Node } from './Node'
import { getCurrentAccount } from './utils'
import { web3 } from './web3'

export class NodeFactory {


  public async newGoal(name: string, inboundAddrs: string[], outboundAddrs: string[], onProgress: Function, done: Function, onFail: Function): Promise<Node> {
    const symbol = `GOAL-${this._randomNumber()}`
    return this._newNode(symbol, name, "goal", inboundAddrs.join(" "), outboundAddrs.join(" "), onProgress, done, onFail)
  }

  public async newProject(name: string, inboundAddrs: string[], outboundAddrs: string[], onProgress: Function, done: Function, onFail: Function): Promise<Node> {
    const symbol = `PROJ-${this._randomNumber()}`
    return this._newNode(symbol, name, "project", inboundAddrs.join(" "), outboundAddrs.join(" "), onProgress, done, onFail)
  }

  private async _newNode(
    symbol: string,
    name: string,
    type: string,
    inboundAddrs: string,
    outboundAddrs: string,
    onProgress: Function = ()=>{},
    done: Function = ()=>{},
    fail: Function = ()=>{},
  ): Promise<Node> {

    try {

      const chainId: number = await web3.eth.getChainId()
      const config: Config = new ConfigHelper().getConfig(chainId)

      const factory: NftFactory = new NftFactory(
        config.erc721FactoryAddress,
        web3
      )

      // get Metamask account
      const account = await getCurrentAccount()

      onProgress(0, "Web3 Account selected", { account });

      // create new nft
      const nftParams: NftCreateData = {
        name,
        symbol,
        templateIndex: 1,
        tokenURI: 'https://oceanprotocol.com/nft/',
        transferable: true,
        owner: account
      }

      //TODO: Needs rework
      const erc20Params: Erc20CreateParams = {
        templateIndex: 1,
        cap: '1',
        feeAmount: '0',
        paymentCollector: ZERO_ADDRESS,
        feeToken: ZERO_ADDRESS,
        minter: account,
        mpFeeAddress: ZERO_ADDRESS
      }

      const dispenserParams: DispenserCreationParams = {
        dispenserAddress: config.dispenserAddress,
        maxTokens: '1',
        maxBalance: '1',
        withMint: true,
        allowedSwapper: ZERO_ADDRESS
      }

      onProgress(1, "Creating NFT")

      const tx = await factory.createNftErc20WithDispenser(
        account,
        nftParams,
        erc20Params,
        dispenserParams
      )


      const nftAddress = tx.events.NFTCreated.returnValues[0]

      const dataTokenAddress = tx.events.TokenCreated.returnValues[0]

      onProgress(2, "NFT created", { nftAddress, dataTokenAddress, transaction: tx })

      const ddo = this._getDdoData(chainId, nftAddress, dataTokenAddress, symbol, name, type, inboundAddrs, outboundAddrs)

      onProgress(3, "DDO", { ddo })

      const encryptedResponse = await ProviderInstance.encrypt(ddo, config.providerUri)

      onProgress(4, "Provider response", { encryptedResponse })

      onProgress(5, "Setting DDO in NFT as metadata", { did: generateDid(nftAddress, chainId) })

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

      onProgress(6, "DDO set")

      const node = new Node(
        nftAddress,
        web3,
        chainId,
        config,
        ddo.id,
        ddo.metadata
      )

      onProgress(7, "Waiting for Aquarius")

      const response = await this._waitForAqua(ddo, config)
      onProgress(8, "Node id cached in Aquarius", { response })

      return done(node)

    } catch (error) {
      fail(error);
    }

  }

  private _waitForAqua(ddo: any, config: any): Promise<any> {

    const aquarius = new Aquarius(config.metadataCacheUri)

    return aquarius.waitForAqua(ddo.id);

  }

  private _getDdoData(
    chainId: number,
    nftAddress: string,
    dataTokenAddress: string,
    symbol: string,
    name: string,
    type: string,
    inbound_addrs: string = "",
    outbound_addrs: string = "",
    ): DDO {

    // set ddo metadata
    const ddo: DDO = {
      '@context': ['https://w3id.org/did/v1'],
      id: generateDid(nftAddress, chainId),
      nftAddress,
      version: '4.5.0',
      chainId,
      metadata: {
        created: new Date().toISOString().replace(/\.[0-9]{3}Z/, 'Z'),
        updated: new Date().toISOString().replace(/\.[0-9]{3}Z/, 'Z'),
        type: 'dataset',
        name: symbol,
        description: name,
        tags: ['themap'],
        author: 'TheMap',
        license: 'https://market.oceanprotocol.com/terms',
        additionalInformation: {
          inbound_addrs,
          outbound_addrs,
          deleted: false,
          type
        }
      },
      services: []
    }

    return ddo
  }

  private _randomNumber(): string {
    const random = Math.floor(Math.random() * 9999)
    return String(random).padStart(4, '0')
  }
}
