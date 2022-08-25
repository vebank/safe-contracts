const VeSafe = artifacts.require("VeSafe");
let AddressZero = "0x0000000000000000000000000000000000000000";
const {Database} = require('../db/index.js')

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
    await deployer.deploy(VeSafe)
    let safe = await VeSafe.deployed()

    let OWNERS = [
        '0x81ab2Dc3e4F92A91C23e4c8002c5DCf3A249167c',
        '0x007377adfBD013E0a585A62475D223f3939B92FC',
        '0x23Fd7c63c35fd26aC5C4E7e6dc52CcA6ab7511D7'
    ]
    OWNERS.sort((left, right) => left.toLowerCase().localeCompare(right.toLowerCase()))

    let signed = await safe.getSigned(OWNERS)
    console.log('signed', signed.toString())
    let signatures = []
    for (let _sign of OWNERS) {
        signatures.push({
            signer: _sign,
            data: getSigned(_sign)
        })
    }
    console.log('signatures', signatures)

    const signatureBytes = buildSignatureBytes(signatures)
    console.log('signatureBytes', signatureBytes)
    console.log("compare", signatureBytes === signed.toString())
}
