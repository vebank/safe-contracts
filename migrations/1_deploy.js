const VeSafe = artifacts.require("VeSafe");
const {Database} = require('../db/index.js')
const db = new Database(true)

module.exports = async function (deployer, network) {
    let deployed;

    await deployer.deploy(VeSafe)
    deployed = await VeSafe.deployed()

    await db.write(network, 'VeSafe', deployed.address);

};
