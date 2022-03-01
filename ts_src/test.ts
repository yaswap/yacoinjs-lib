import * as yacoin from './index';

const bjsTx = yacoin.Transaction.fromHex('0200000092d9196200000000010000000000000000000000000000000000000000000000000000000000000000ffffffff0d03e4ea1c0143062f503253482fffffffff01a7a74e0000000000232102e28d69eae6b64223d01f14f93d6f471962cd4d84dd88b9d7e4ee00ee30e7dc2dac00000000')
console.log('version = ', bjsTx.version)
console.log('time = ', bjsTx.time)
console.log('locktime = ', bjsTx.locktime)

bjsTx.ins.forEach((input) => {
    console.log('--------------VIN----------------')
    console.log('txid = ',  Buffer.from(input.hash).reverse().toString('hex'))
    console.log('vout = ',  input.index)
    console.log('scriptSig asm = ',  yacoin.script.toASM(input.script))
    console.log('scriptSig hex = ',  input.script.toString('hex'))
    console.log('sequence = ',  input.sequence)
})

bjsTx.outs.forEach((output, n) => {
    console.log('--------------VOUT----------------')
    console.log('value = ',  output.value / 1e6)
    console.log('n = ',  n)
    console.log('scriptPubKey asm = ',  yacoin.script.toASM(output.script))
    console.log('scriptPubKey hex = ',  output.script.toString('hex'))
    console.log('scriptPubKey reqSigs = ',  1)
    console.log('scriptPubKey addresses = ', yacoin.address.fromOutputScript(output.script, yacoin.networks.yacoin))
})