const VeSafe = artifacts.require("VeSafe");
let AddressZero = "0x0000000000000000000000000000000000000000";
const {utils} = require("web3")

const {Database} = require('../db/index.js')


const ERC20Token = artifacts.require("ERC20Token");

const db = new Database(true)
const getSigned = (owner = '') => {
    return "0x000000000000000000000000" + owner.slice(2) + "0000000000000000000000000000000000000000000000000000000000000000" + "01"
}
const buildSignatureBytes = (signatures) => {
    signatures.sort((left, right) => left.signer.toLowerCase().localeCompare(right.signer.toLowerCase()))
    let signatureBytes = "0x"
    for (const sig of signatures) {
        signatureBytes += sig.data.slice(2)
    }
    return signatureBytes
}
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
    let _usersApproved = await safe.checkApproved(txHash.toString())
    console.log(_usersApproved, _usersApproved.toString())
    let signers = []
    for (let _add of _usersApproved) {
        if (_add !== '0x0000000000000000000000000000000000000000') {
            signers.push(_add)
        }
    }
    console.log('typedDataHash', txHash.toString())
    signers.sort()
    console.log(signers)
    let signatureBytes = await safe.getSigned(signers)
    console.log('signatureBytes', signatureBytes)

    await safe.execTransaction(_tx.to, _tx.value, _tx.data, _tx.operation, _tx.safeTxGas, _tx.baseGas, _tx.gasPrice, _tx.gasToken, _tx.refundReceiver, signatureBytes.toString())
    let afterBalanceOfReceiver = await token.balanceOf(to_address)
    console.log("afterBalanceOfReceiver", afterBalanceOfReceiver.toString())
}
