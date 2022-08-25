const VeSafe = artifacts.require("VeSafe");
let AddressZero = "0x0000000000000000000000000000000000000000";
const {utils} = require("web3")

const {Database} = require('../db/index.js')


const ERC20Token = artifacts.require("ERC20Token");

const db = new Database(true)

module.exports = async function (deployer, network, accounts) {
    let signer = accounts[0]
    console.log('signer', signer)
    let to_address = '0x7F66E2b88eFf8Bd5fbF1DCBd4c9d8b611fC14cC1'
    let address = await db.read(network, 'VeSafe');
    let safe = await VeSafe.at(address);
    let _tokenAddress = await db.read(network, 'ERC20Token')
    let token = await ERC20Token.at(_tokenAddress)
    let _nonce = await safe.nonce()
    const data = token.contract.methods.transfer(to_address, utils.toWei("56")).encodeABI()
    console.log('data', data)

    let _tx = {
        to: token.address,
        nonce: _nonce.toString(),
        value: 0,
        data: data,
        operation: 0,
        baseGas: 0,
        gasPrice: 0,
        gasToken: AddressZero,
        safeTxGas: 0,
        refundReceiver: AddressZero
    }
    console.log('_tx', _tx)
    let txHash = await safe.getTransactionHash(_tx.to, _tx.value,
        _tx.data, _tx.operation,
        _tx.safeTxGas, _tx.baseGas, _tx.gasPrice, _tx.gasToken, _tx.refundReceiver, _nonce)
    console.log('typedDataHash', txHash)

}
