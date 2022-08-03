import { Aquarius, Config, ConfigHelper } from '@oceanprotocol/lib'
import { web3 } from './web3'

export class NodeSearch {
  public async querySearch(config: Config, query: any, signal?: AbortSignal) {
    const aquarius = new Aquarius(config.metadataCacheUri)

    const path = aquarius.aquariusURL + '/api/aquarius/assets/query'

    try {
      const response = await fetch(path, {
        method: 'POST',
        body: JSON.stringify(query),
        headers: {
          'Content-Type': 'application/json'
        },
        signal
      })

      if (response.ok) {
        return response.json()
      } else {
        throw new Error('querySearch failed: ' + response.status + response.statusText)
      }
    } catch (error) {
      throw new Error('Error querying metadata: ' + error)
    }
  }

  public async search(searchQuery: any) {
    const chainId: number = await web3.eth.getChainId()
    const config: Config = new ConfigHelper().getConfig(chainId)

    const nodes = await this.querySearch(config, searchQuery)
    if (nodes.hits && nodes.hits.hits) {
      // return nodes.hits.hits.map(hit => hit._source)
      nodes.hits.hits.map((hit) => console.log(hit._source))
    }

    console.log(nodes)
  }

  public async searchTest() {
    const chainId: number = await web3.eth.getChainId()

    const searchQuery = {
      query: {
        bool: {
          must: [
            {
              bool: {
                should: [
                  {
                    query_string: {
                      query: '(metadata.tags:"themap")',
                      fields: ['metadata.tags'],
                      default_operator: 'AND'
                    }
                  }
                ]
              }
            }
          ],
          filter: [
            {
              terms: {
                chainId: [chainId]
              }
            },
            {
              term: {
                'purgatory.state': false
              }
            }
          ]
        }
      },
      size: 10000
    }

    await this.search(searchQuery)
  }
}
