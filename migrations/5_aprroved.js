const VeSafe = artifacts.require("VeSafe");
const {Database} = require('../db/index.js')

const db = new Database(true)
let txHash = '0xc7768389c08dda5cc1d7791a121bc81394fe2b193e5c3602823311ed72030f0f'
module.exports = async function (deployer, network, accounts) {

    let signer = accounts[0]
    console.log('signer', signer)
    let address = await db.read(network, 'VeSafe');
    let safe = await VeSafe.at(address);
    await safe.approveHash(txHash)
    let _addressApproved = await safe.checkApproved(txHash)
    console.log(_addressApproved, _addressApproved.toString())
}
