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

  public async searchText(text: string) {
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
                  },
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

  private escapeESReservedChars(text: string): string {
    return text?.replace(/([!*+\-=<>&|()\\[\]{}^~?:\\/"])/g, '\\$1')
  }
}
