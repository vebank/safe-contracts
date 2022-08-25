const VeSafe = artifacts.require("VeSafe");
let AddressZero = "0x0000000000000000000000000000000000000000";
const {Database} = require('../db/index.js')

const db = new Database(true)

module.exports = async function (deployer, network, accounts) {

    let OWNERS = [
        '0x007377adfBD013E0a585A62475D223f3939B92FC',
        '0x24d39F8c3c38Df135Fd28078e6A2e2dCF9284FBB',
        '0xA7e02265F5d973178f8466b39076abE529467c74',
        '0xE1bBEa38Cc95240680c2ab4940c9F202C90184BA'
    ]
    let _threshold = "3"
    let to = AddressZero
    let address = await db.read(network, 'VeSafe');
    let safe = await VeSafe.at(address);
    await safe.setup(OWNERS, _threshold, to, "0x", to, to, "0", to)
}
