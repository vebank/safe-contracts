
const ERC20Token = artifacts.require("ERC20Token");
const {Database} = require('../db/index.js')

const db = new Database(false)

module.exports = async function (deployer, network) {
    let deployed;

    await deployer.deploy(ERC20Token)
    deployed = await ERC20Token.deployed()

    await db.write(network, 'ERC20Token', deployed.address);

};
