import { Aquarius, Config, ConfigHelper } from '@oceanprotocol/lib'
import { Node } from './Node'
import { web3 } from './web3'

export class NodeSearch {
  public async search(searchQuery: any): Promise<Node[]> {
    const chainId: number = await web3.eth.getChainId()
    const config: Config = new ConfigHelper().getConfig(chainId)

    const aquarius = new Aquarius(config.metadataCacheUri)

    const nodes = await aquarius.querySearch(searchQuery)
    let nodesFound: Node[]
    if (nodes.hits && nodes.hits.hits) {
      // return nodes.hits.hits.map(hit => hit._source)
      nodesFound = nodes.hits.hits.map((hit) => {
          return new Node(hit._source.nftAddress, web3, chainId, config)
        }
      )
    }

    return nodesFound
  }

  public async searchAll(): Promise<Node[]> {
    const chainId: number = await web3.eth.getChainId()

    const searchQuery = {
      query: {
        bool: {
          filter: [
            {
              terms: {
                chainId: [chainId]
              }
            },
            {
              terms: {
                'metadata.tags': ['themap']
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

    return this.search(searchQuery)
  }

  public async searchText(text: string): Promise<Node[]> {
    text = this.escapeESReservedChars(text)
    const emptySearchTerm = text === undefined || text === ''

    const searchTerm = text.trim()
    const modifiedSearchTerm = searchTerm.split(' ').join(' OR ').trim()
    const noSpaceSearchTerm = searchTerm.split(' ').join('').trim()

    const prefixedSearchTerm =
      emptySearchTerm && searchTerm
        ? searchTerm
        : !emptySearchTerm && searchTerm
        ? '*' + searchTerm + '*'
        : '**'
    const searchFields = [
      'id',
      'nft.owner',
      'datatokens.address',
      'datatokens.name',
      'datatokens.symbol',
      'metadata.name^10',
      'metadata.author',
      'metadata.description',
      'metadata.tags'
    ]

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
                      query: `${modifiedSearchTerm}`,
                      fields: searchFields,
                      minimum_should_match: '2<75%',
                      phrase_slop: 2,
                      boost: 5
                    }
                  },
                  {
                    query_string: {
                      query: `${noSpaceSearchTerm}*`,
                      fields: searchFields,
                      boost: 5,
                      lenient: true
                    }
                  },
                  {
                    match_phrase: {
                      content: {
                        query: `${searchTerm}`,
                        boost: 10
                      }
                    }
                  },
                  {
                    query_string: {
                      query: `${prefixedSearchTerm}`,
                      fields: searchFields,
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
              terms: {
                'metadata.tags': ['themap']
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

    return this.search(searchQuery)
  }

  private escapeESReservedChars(text: string): string {
    return text?.replace(/([!*+\-=<>&|()\\[\]{}^~?:\\/"])/g, '\\$1')
  }
}
