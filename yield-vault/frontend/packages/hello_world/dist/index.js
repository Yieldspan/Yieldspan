import { Buffer } from "buffer";
import { Client as ContractClient, Spec as ContractSpec, } from '@stellar/stellar-sdk/contract';
export * from '@stellar/stellar-sdk';
export * as contract from '@stellar/stellar-sdk/contract';
export * as rpc from '@stellar/stellar-sdk/rpc';
if (typeof window !== 'undefined') {
    //@ts-ignore Buffer exists
    window.Buffer = window.Buffer || Buffer;
}
export const networks = {
    testnet: {
        networkPassphrase: "Test SDF Network ; September 2015",
        contractId: "CBTTH7FN2AUD2RO2QPJTTUBFTVMHP4DBNUJQKHAJ5PS3XWSATF45T4NE",
    }
};
export class Client extends ContractClient {
    options;
    static async deploy(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options) {
        return ContractClient.deploy(null, options);
    }
    constructor(options) {
        super(new ContractSpec(["AAAAAAAAAAAAAAAHZGVwb3NpdAAAAAACAAAAAAAAAAR1c2VyAAAAEwAAAAAAAAAGYW1vdW50AAAAAAALAAAAAA==",
            "AAAAAAAAAAAAAAAId2l0aGRyYXcAAAACAAAAAAAAAAR1c2VyAAAAEwAAAAAAAAAGYW1vdW50AAAAAAALAAAAAA==",
            "AAAAAAAAAAAAAAAKYmFsYW5jZV9vZgAAAAAAAQAAAAAAAAAEdXNlcgAAABMAAAABAAAACw==",
            "AAAAAAAAAAAAAAAOdG90YWxfZGVwb3NpdHMAAAAAAAAAAAABAAAACw=="]), options);
        this.options = options;
    }
    fromJSON = {
        deposit: (this.txFromJSON),
        withdraw: (this.txFromJSON),
        balance_of: (this.txFromJSON),
        total_deposits: (this.txFromJSON)
    };
}
