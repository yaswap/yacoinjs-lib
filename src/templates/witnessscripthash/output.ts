// OP_0 {scriptHash}

import * as bscript from '../../script'
const OPS = require('bitcoin-ops')

export function check (script: Buffer | Array<number | Buffer>): boolean {
  const buffer = bscript.compile(script)

  return buffer.length === 34 &&
    buffer[0] === OPS.OP_0 &&
    buffer[1] === 0x20
}
check.toJSON = function () { return 'Witness scriptHash output' }
