import { BufferReader, BufferWriter, reverseBuffer } from './bufferutils';
import * as bcrypto from './crypto';
import { Transaction } from './transaction';
import * as types from './types';

const fastMerkleRoot = require('merkle-lib/fastRoot');
const typeforce = require('typeforce');
const varuint = require('varuint-bitcoin');

const errorMerkleNoTxes = new TypeError(
  'Cannot compute merkle root for zero transactions',
);

export class Block {
  static fromBuffer(buffer: Buffer): Block {
    if (buffer.length < 80) throw new Error('Buffer too small (< 80 bytes)');

    const bufferReader = new BufferReader(buffer);

    const block = new Block();
    block.version = bufferReader.readInt32();
    block.prevHash = bufferReader.readSlice(32);
    block.merkleRoot = bufferReader.readSlice(32);
    block.timestamp = bufferReader.readUInt32();
    block.bits = bufferReader.readUInt32();
    block.nonce = bufferReader.readUInt32();

    if (buffer.length === 80) return block;

    const readTransaction = (): any => {
      const tx = Transaction.fromBuffer(
        bufferReader.buffer.slice(bufferReader.offset),
        true,
      );
      bufferReader.offset += tx.byteLength();
      return tx;
    };

    const nTransactions = bufferReader.readVarInt();
    block.transactions = [];

    for (let i = 0; i < nTransactions; ++i) {
      const tx = readTransaction();
      block.transactions.push(tx);
    }

    return block;
  }

  static fromHex(hex: string): Block {
    return Block.fromBuffer(Buffer.from(hex, 'hex'));
  }

  static calculateTarget(bits: number): Buffer {
    const exponent = ((bits & 0xff000000) >> 24) - 3;
    const mantissa = bits & 0x007fffff;
    const target = Buffer.alloc(32, 0);
    target.writeUIntBE(mantissa, 29 - exponent, 3);
    return target;
  }

  static calculateMerkleRoot(transactions: Transaction[]): Buffer {
    typeforce([{ getHash: types.Function }], transactions);
    if (transactions.length === 0) throw errorMerkleNoTxes;

    const hashes = transactions.map(transaction => transaction.getHash());

    const rootHash = fastMerkleRoot(hashes, bcrypto.hash256);

    return rootHash;
  }

  version: number = 1;
  prevHash?: Buffer = undefined;
  merkleRoot?: Buffer = undefined;
  timestamp: number = 0;
  witnessCommit?: Buffer = undefined;
  bits: number = 0;
  nonce: number = 0;
  transactions?: Transaction[] = undefined;

  weight(): number {
    const base = this.byteLength(false);
    const total = this.byteLength(false);
    return base * 3 + total;
  }

  byteLength(headersOnly?: boolean): number {
    if (headersOnly || !this.transactions) return 80;

    return (
      80 +
      varuint.encodingLength(this.transactions.length) +
      this.transactions.reduce((a, x) => a + x.byteLength(), 0)
    );
  }

  getHash(): Buffer {
    return bcrypto.hash256(this.toBuffer(true));
  }

  getId(): string {
    return reverseBuffer(this.getHash()).toString('hex');
  }

  getUTCDate(): Date {
    const date = new Date(0); // epoch
    date.setUTCSeconds(this.timestamp);

    return date;
  }

  // TODO: buffer, offset compatibility
  toBuffer(headersOnly?: boolean): Buffer {
    const buffer: Buffer = Buffer.allocUnsafe(this.byteLength(headersOnly));

    const bufferWriter = new BufferWriter(buffer);

    bufferWriter.writeInt32(this.version);
    bufferWriter.writeSlice(this.prevHash!);
    bufferWriter.writeSlice(this.merkleRoot!);
    bufferWriter.writeUInt32(this.timestamp);
    bufferWriter.writeUInt32(this.bits);
    bufferWriter.writeUInt32(this.nonce);

    if (headersOnly || !this.transactions) return buffer;

    varuint.encode(this.transactions.length, buffer, bufferWriter.offset);
    bufferWriter.offset += varuint.encode.bytes;

    this.transactions.forEach(tx => {
      const txSize = tx.byteLength(); // TODO: extract from toBuffer?
      tx.toBuffer(buffer, bufferWriter.offset);
      bufferWriter.offset += txSize;
    });

    return buffer;
  }

  toHex(headersOnly?: boolean): string {
    return this.toBuffer(headersOnly).toString('hex');
  }

  checkTxRoots(): boolean {
    return this.__checkMerkleRoot();
  }

  checkProofOfWork(): boolean {
    const hash: Buffer = reverseBuffer(this.getHash());
    const target = Block.calculateTarget(this.bits);

    return hash.compare(target) <= 0;
  }

  private __checkMerkleRoot(): boolean {
    if (!this.transactions) throw errorMerkleNoTxes;

    const actualMerkleRoot = Block.calculateMerkleRoot(this.transactions);
    return this.merkleRoot!.compare(actualMerkleRoot) === 0;
  }
}
