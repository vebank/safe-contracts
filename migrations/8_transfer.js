const ERC20Token = artifacts.require("ERC20Token");
const {Database} = require('../db/index.js')
const {utils} = require("web3");

const db = new Database(true)

module.exports = async function (deployer, network) {
    let _tokenAddress = await db.read(network, 'ERC20Token')
    let token = await ERC20Token.at(_tokenAddress)
    let address = await db.read(network, 'VeSafe');
    await token.transfer(address, utils.toWei("100000"))
};
