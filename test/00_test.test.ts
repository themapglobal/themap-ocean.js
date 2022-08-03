import { NodeFactory, NodeSearch } from '../src'

describe('Test themap-ocean.js library', () => {
  it('general test', async () => {
    // create new nodes using the node factory
    const nodeFactory = new NodeFactory()

    console.log('------------------------------------------------')
    const goalPyWasm = await nodeFactory.newGoal('Py run on WASM')
    console.log(`goal.symbol: ${await goalPyWasm.symbol()}`)
    console.log(`goal.name: ${await goalPyWasm.name()}`)
    console.log(`goal.address: ${goalPyWasm.nftAddress}`)
    console.log(`goal.inbound: ${await goalPyWasm.getInboundAddrs()}`)
    console.log(`goal.outbound: ${await goalPyWasm.getOutboundAddrs()}`)

    console.log('------------------------------------------------')
    const goalPyBrowser = await nodeFactory.newGoal('Py run in browser')
    await goalPyBrowser.addInboundNode(goalPyWasm)
    console.log(`goal.symbol: ${await goalPyBrowser.symbol()}`)
    console.log(`goal.name: ${await goalPyBrowser.name()}`)
    console.log(`goal.address: ${goalPyBrowser.nftAddress}`)
    console.log(`goal.inbound: ${await goalPyBrowser.getInboundAddrs()}`)
    console.log(`goal.outbound: ${await goalPyBrowser.getOutboundAddrs()}`)

    console.log('------------------------------------------------')
    const projectX = await nodeFactory.newProject('Proj.: X')
    await projectX.addOutboundNode(goalPyBrowser)
    console.log(`project.symbol: ${await projectX.symbol()}`)
    console.log(`project.name: ${await projectX.name()}`)
    console.log(`project.address: ${projectX.nftAddress}`)
    console.log(`project.inbound: ${await projectX.getInboundAddrs()}`)
    console.log(`project.outbound: ${await projectX.getOutboundAddrs()}`)

    console.log('------------------------------------------------')
    const projectY = await nodeFactory.newProject('Proj.: Y')
    await projectY.addOutboundNode(goalPyBrowser)
    console.log(`project.symbol: ${await projectY.symbol()}`)
    console.log(`project.name: ${await projectY.name()}`)
    console.log(`project.address: ${projectY.nftAddress}`)
    console.log(`project.inbound: ${await projectY.getInboundAddrs()}`)
    console.log(`project.outbound: ${await projectY.getOutboundAddrs()}`)

    console.log('------------------------------------------------')
    const projectPyscript = await nodeFactory.newProject('Project: Pyscript')
    await projectPyscript.addInboundNode(goalPyWasm)
    await projectPyscript.addOutboundNode(goalPyBrowser)
    await projectPyscript.addOutboundNode(projectY)
    console.log(`project.symbol: ${await projectPyscript.symbol()}`)
    console.log(`project.name: ${await projectPyscript.name()}`)
    console.log(`project.address: ${projectPyscript.nftAddress}`)
    console.log(`project.inbound: ${await projectPyscript.getInboundAddrs()}`)
    console.log(`project.outbound: ${await projectPyscript.getOutboundAddrs()}`)

    const nodeSearch = new NodeSearch()
    await nodeSearch.searchTest()
  })
})
