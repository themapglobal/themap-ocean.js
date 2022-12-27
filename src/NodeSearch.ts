import { Aquarius, Config, ConfigHelper, generateDid } from '@oceanprotocol/lib'
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

		let mockMetadata = true;
		// if true, inject parent, pos, nodeOpts and edgeOpts into metadata.additionalInformation
	
		if(mockMetadata){
			console.log("mocking data for grapher");
			const inboundEdges = hit._source.metadata.additionalInformation.inbound_addrs ? hit._source.metadata.additionalInformation.inbound_addrs.split(" ") : [];
			const outboundEdges = hit._source.metadata.additionalInformation.outbound_addrs ? hit._source.metadata.additionalInformation.outbound_addrs.split(" ") : [];
			let edgeOpts = {};
	
			inboundEdges.forEach(edge => {
				edgeOpts[edge] = {
					label: 'mock edge-label',
					desc: 'mock edge-desc',
					weight: 5,
					tags: []
				};
			});
	
			outboundEdges.forEach(edge => {
				edgeOpts[edge] = {
					label: 'mock edge-label',
					desc: 'mock edge-desc',
					weight: 5,
					tags: []
				};
			});
			
			return new Node(
				hit._source.nftAddress,
				web3,
				chainId,
				config,
				hit._source.id,
				{
					...hit._source.metadata,
					additionalInformation: {
						...hit._source.metadata.additionalInformation,
						nodeOpts: {
							parent: null,
							pos: {x: (100 + Math.floor(Math.random() * 1000)), y: (100 + Math.floor(Math.random() * 1000))},
							notes: 'mock node-notes',
							desc: 'mock node-desc',
						},
						edgeOpts: edgeOpts
					}
				}
			)
		} else {
			return new Node(
				hit._source.nftAddress,
				web3,
				chainId,
				config,
				hit._source.id,
				hit._source.metadata
			);
		}
      })
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
            },
            {
              term: {
                'metadata.additionalInformation.deleted': false
              }
            }
          ]
        }
      },
      size: 10000
    }

    return this.search(searchQuery)
  }

  public async searchByMapCategory(mapCategory: string): Promise<Node[]> {
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
                'metadata.tags': ['themap', mapCategory]
              }
            },
            {
              term: {
                'purgatory.state': false
              }
            },
            {
              term: {
                'metadata.additionalInformation.deleted': false
              }
            }
          ]
        }
      },
      size: 10000
    }

    return this.search(searchQuery)
  }

  public async searchByNftAddress(addr: string): Promise<any> {

    const chainId: number = await web3.eth.getChainId()
    const config: Config = new ConfigHelper().getConfig(chainId)

    const aquarius = new Aquarius(config.metadataCacheUri)
    const response = await aquarius.resolve(generateDid(addr, chainId));

	let mockMetadata = true;
	// if true, inject parent, pos, nodeOpts and edgeOpts into metadata.additionalInformation

	if(mockMetadata){
		console.log("mocking data for grapher");
		const inboundEdges = response.metadata.additionalInformation.inbound_addrs ? response.metadata.additionalInformation.inbound_addrs.split(" ") : [];
        const outboundEdges = response.metadata.additionalInformation.outbound_addrs ? response.metadata.additionalInformation.outbound_addrs.split(" ") : [];
		let edgeOpts = {};

		inboundEdges.forEach(edge => {
            edgeOpts[edge] = {
				label: 'mock edge-label',
				desc: 'mock edge-desc',
				weight: 5,
				tags: []
			};
        });

		outboundEdges.forEach(edge => {
            edgeOpts[edge] = {
				label: 'mock edge-label',
				desc: 'mock edge-desc',
				weight: 5,
				tags: []
			};
        });
		
		return new Node(
			response.nftAddress,
			web3,
			chainId,
			config,
			response.id,
			{
				...response.metadata,
				additionalInformation: {
					...response.metadata.additionalInformation,
					nodeOpts: {
						parent: null,
						pos: {x: (100 + Math.floor(Math.random() * 1000)), y: (100 + Math.floor(Math.random() * 1000))},
						notes: 'mock node-notes',
						desc: 'mock node-desc',
					},
					edgeOpts: edgeOpts
				}
			}
		)
	} else {
		return new Node(
			response.nftAddress,
			web3,
			chainId,
			config,
			response.id,
			response.metadata
		);
	}
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
