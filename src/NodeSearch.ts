import { Aquarius, Config, ConfigHelper } from '@oceanprotocol/lib'
import { web3 } from './web3'

export class NodeSearch {
  public async search(searchQuery: any) {
    const chainId: number = await web3.eth.getChainId()
    const config: Config = new ConfigHelper().getConfig(chainId)

    const aquarius = new Aquarius(config.metadataCacheUri)

    const nodes = await aquarius.querySearch(searchQuery)
    if (nodes.hits && nodes.hits.hits) {
      // return nodes.hits.hits.map(hit => hit._source)
      nodes.hits.hits.map((hit) => console.log(hit._source))
    }

    console.log(nodes)
  }
}
