const VeSafe = artifacts.require("VeSafe");
let AddressZero = "0x0000000000000000000000000000000000000000";
const {utils} = require("web3")
const ethers = require("ethers")
const Util = require('ethereumjs-util');

const {Database} = require('../db/index.js')
const fs = require("fs");
const keythereum = require("keythereum");

const KEYSTORE = "../keystore";
const PASSWORD = "123456789";

const keyObject = JSON.parse(fs.readFileSync(KEYSTORE, {encoding: "utf8"}));

function signTransaction(transactionHash) {
    const msgBuff = new Buffer(Util.stripHexPrefix(transactionHash), 'hex');
    let privateKeyBuff = keythereum.recover(PASSWORD, keyObject)
    let sig = Util.ecsign(msgBuff, privateKeyBuff);
    console.log(sig)
    return  "0x" + sig.r.toString('hex') + sig.s.toString('hex') + sig.v.toString(16)
}

const getSigned = (owner = '') => {
    return "0x000000000000000000000000" + owner.slice(2) + "0000000000000000000000000000000000000000000000000000000000000000" + "01"
}
const ERC20Token = artifacts.require("ERC20Token");
const EIP712_SAFE_TX_TYPE = {
    // "SafeTx(address to,uint256 value,bytes data,uint8 operation,uint256 safeTxGas,uint256 baseGas,uint256 gasPrice,address gasToken,address refundReceiver,uint256 nonce)"
    SafeTx: [
        {type: "address", name: "to"},
        {type: "uint256", name: "value"},
        {type: "bytes", name: "data"},
        {type: "uint8", name: "operation"},
        {type: "uint256", name: "safeTxGas"},
        {type: "uint256", name: "baseGas"},
        {type: "uint256", name: "gasPrice"},
        {type: "address", name: "gasToken"},
        {type: "address", name: "refundReceiver"},
        {type: "uint256", name: "nonce"},
    ]
}
const db = new Database(false)
const TRANSFER = 0
const calculateSafeTransactionHash = (safe, safeTx, chainId) => {
    return ethers.utils._TypedDataEncoder.hash({verifyingContract: safe, chainId}, EIP712_SAFE_TX_TYPE, safeTx)
}
let txHash = '0xb37cf557c2d57b6bf66fa3cb83433b4f0094ccfd63de1e5f39dcd0ed3f3e889b'
const buildSignatureBytes = (signatures) => {
    signatures.sort((left, right) => left.signer.toLowerCase().localeCompare(right.signer.toLowerCase()))
    let signatureBytes = "0x"
    for (const sig of signatures) {
        signatureBytes += sig.data.slice(2)
    }
    return signatureBytes
}
module.exports = async function (deployer, network, accounts) {
    //
    // let OWNERS = [
    //     '0x81ab2Dc3e4F92A91C23e4c8002c5DCf3A249167c', '0x23Fd7c63c35fd26aC5C4E7e6dc52CcA6ab7511D7'
    // ]
    let signer = accounts[0]
    console.log('signer', signer)
    let to_address = '0x7F66E2b88eFf8Bd5fbF1DCBd4c9d8b611fC14cC1'
    let address = await db.read(network, 'VeSafe');
    let safe = await VeSafe.at(address);
    let _tokenAddress = await db.read(network, 'ERC20Token')
    let token = await ERC20Token.at(_tokenAddress)
    let safeBalance = await token.balanceOf(address)
    console.log("safeBalance", safeBalance.toString())
    let balanceOfReceiver = await token.balanceOf(to_address)
    console.log("balanceOfReceiver", balanceOfReceiver.toString())
    if (TRANSFER) {
        await token.transfer(address, utils.toWei("10000"))
        safeBalance = await token.balanceOf(address)
        console.log("transfer - safeBalance", safeBalance.toString())
    }
    let _chainId = await safe.getChainId()
    console.log('_chainId', _chainId.toString())
    let _nonce = await safe.nonce()
    const data = token.contract.methods.transfer(to_address, utils.toWei("55")).encodeABI()
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
    txHash = await safe.getTransactionHash(_tx.to, _tx.value,
        _tx.data, _tx.operation,
        _tx.safeTxGas, _tx.baseGas, _tx.gasPrice, _tx.gasToken, _tx.refundReceiver, _nonce)
    console.log('typedDataHash', txHash)

    // await safe.approveHash(txHash.toString())
    const _owners = await safe.getOwners()
    console.log('getOwners', _owners, _owners.toString())
    console.log('typedDataHash', txHash.toString())
    console.log({
            verifyingContract: safe.address,
            chainId: _chainId
        },
        EIP712_SAFE_TX_TYPE, _tx)
    let signers = ['0x007377adfBD013E0a585A62475D223f3939B92FC', signer]
    signers.sort()
    let signatures = []
    for (let _sign of signers) {
        if (_sign.toLowerCase() === signer.toLowerCase()) {
            signatures.push({
                signer: _sign,
                data: signTransaction(
                    txHash
                )
            })
        } else {
            console.log("not signed")
            signatures.push({
                signer: _sign,
                data:  "0x23a9b4a8458d93c46719004a1cb37f9eb7b4cc1a7d3a424b4832a88a98dd76e967479836c0317e47a18c6bb49374743d02fbc40b98480b2db318c6723917516a1c"//getSigned(_sign)
            })
        }
    }

    console.log('signatures', signatures)
    // let sig =  await new Signer()._signTypedData({ verifyingContract: safe.address, chainId: _chainId }, EIP712_SAFE_TX_TYPE, _tx)
    // console.log('sig', sig)
    const signatureBytes = buildSignatureBytes(signatures)
    console.log('signatureBytes', signatureBytes)

    await safe.execTransaction(_tx.to, _tx.value, _tx.data, _tx.operation, _tx.safeTxGas, _tx.baseGas, _tx.gasPrice, _tx.gasToken, _tx.refundReceiver, signatureBytes)
    let afterBalanceOfReceiver = await token.balanceOf(to_address)
    console.log("afterBalanceOfReceiver", afterBalanceOfReceiver.toString())
}
