import { Signer } from './ecpair';
import { Network } from './networks';
import { Transaction } from './transaction';
interface UTXO {
    txid: string;
    vout: number;
    value: number;
    token_value?: number;
    address: string;
    script?: string;
    derivationPath?: string;
}
interface TxbSignArg {
    prevOutScriptType: string;
    vin: number;
    keyPair: Signer;
    UTXO?: UTXO;
    redeemScript?: Buffer;
    hashType?: number;
    witnessValue?: number;
    witnessScript?: Buffer;
}
export declare class TransactionBuilder {
    network: Network;
    maximumFeeRate: number;
    static fromTransaction(transaction: Transaction, network?: Network): TransactionBuilder;
    private __PREV_TX_SET;
    private __INPUTS;
    private __TX;
    private __USE_LOW_R;
    constructor(network?: Network, maximumFeeRate?: number);
    setLowR(setting?: boolean): boolean;
    setLockTime(locktime: number): void;
    setVersion(version: number): void;
    setTime(time: number): void;
    addInput(txHash: Buffer | string | Transaction, vout: number, sequence?: number, prevOutScript?: Buffer): number;
    addOutput(scriptPubKey: string | Buffer, value: number): number;
    build(): Transaction;
    buildIncomplete(): Transaction;
    sign(signParams: number | TxbSignArg, keyPair?: Signer, UTXO?: UTXO, redeemScript?: Buffer, hashType?: number, witnessValue?: number, witnessScript?: Buffer): void;
    private __addInputUnsafe;
    private __build;
    private __canModifyInputs;
    private __needsOutputs;
    private __canModifyOutputs;
    private __overMaximumFees;
}
export {};
