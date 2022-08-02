import { INBOUND_KEY, NodeFactory, OUTBOUND_KEY } from '../src'

describe('Test themap-ocean.js library', () => {
  it('general test', async () => {
    // create new nodes using the node factory
    const nodeFactory = new NodeFactory()

    console.log('------------------------------------------------')
    const goalPyWasm = await nodeFactory.newGoal('Py run on WASM')
    console.log(`goal.symbol: ${await goalPyWasm.symbol()}`)
    console.log(`goal.name: ${await goalPyWasm.name()}`)
    console.log(`goal.address: ${goalPyWasm.nftAddress}`)
    console.log(`goal.${INBOUND_KEY}: ${await goalPyWasm.getNodeData(INBOUND_KEY)}`)
    console.log(`goal.${OUTBOUND_KEY}: ${await goalPyWasm.getNodeData(OUTBOUND_KEY)}`)
    /*
    console.log('------------------------------------------------')
    const goalPyBrowser = await nodeFactory.newGoal('Py run in browser')
    await goalPyBrowser.addInboundNode(publisherAccount, goalPyWasm)
    console.log(`goal.symbol: ${await goalPyBrowser.symbol()}`)
    console.log(`goal.name: ${await goalPyBrowser.name()}`)
    console.log(`goal.address: ${goalPyBrowser.nftAddress}`)
    console.log(`goal.${INBOUND_KEY}: ${await goalPyBrowser.getNodeData(INBOUND_KEY)}`)
    console.log(`goal.${OUTBOUND_KEY}: ${await goalPyBrowser.getNodeData(OUTBOUND_KEY)}`)

    console.log('------------------------------------------------')
    const projectX = await nodeFactory.newProject('Proj.: X')
    await projectX.addOutboundNode(publisherAccount, goalPyBrowser)
    console.log(`project.symbol: ${await projectX.symbol()}`)
    console.log(`project.name: ${await projectX.name()}`)
    console.log(`project.address: ${projectX.nftAddress}`)
    console.log(`project.${INBOUND_KEY}: ${await projectX.getNodeData(INBOUND_KEY)}`)
    console.log(`project.${OUTBOUND_KEY}: ${await projectX.getNodeData(OUTBOUND_KEY)}`)

    console.log('------------------------------------------------')
    const projectY = await nodeFactory.newProject('Proj.: Y')
    await projectY.addOutboundNode(publisherAccount, goalPyBrowser)
    console.log(`project.symbol: ${await projectY.symbol()}`)
    console.log(`project.name: ${await projectY.name()}`)
    console.log(`project.address: ${projectY.nftAddress}`)
    console.log(`project.${INBOUND_KEY}: ${await projectY.getNodeData(INBOUND_KEY)}`)
    console.log(`project.${OUTBOUND_KEY}: ${await projectY.getNodeData(OUTBOUND_KEY)}`)

    console.log('------------------------------------------------')
    const projectPyscript = await nodeFactory.newProject('Project: Pyscript')
    await projectPyscript.addInboundNode(publisherAccount, goalPyWasm)
    await projectPyscript.addOutboundNode(publisherAccount, goalPyBrowser)
    await projectPyscript.addOutboundNode(publisherAccount, projectY)
    console.log(`project.symbol: ${await projectPyscript.symbol()}`)
    console.log(`project.name: ${await projectPyscript.name()}`)
    console.log(`project.address: ${projectPyscript.nftAddress}`)
    console.log(
      `project.${INBOUND_KEY}: ${await projectPyscript.getNodeData(INBOUND_KEY)}`
    )
    console.log(
      `project.${OUTBOUND_KEY}: ${await projectPyscript.getNodeData(OUTBOUND_KEY)}`
    )

    // test set metadata
    await projectPyscript.setNodeData(publisherAccount, 'testKey', 'testValue')
    console.log(`project.testKey: ${await projectPyscript.getNodeData('testKey')}`)

    // query aquarius
    const searchQuery: SearchQuery = {
      query: {
        query_string: {
          query: '*'
        }
      }
    }
    const search = await aquarius.querySearch(searchQuery)
    console.log(search)
    */
  })
})
