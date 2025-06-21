import { Buffer } from "buffer";
import { Address } from '@stellar/stellar-sdk';
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from '@stellar/stellar-sdk/contract';

import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Typepoint,
  Duration,
} from '@stellar/stellar-sdk/contract';

export * from '@stellar/stellar-sdk';
export * as contract from '@stellar/stellar-sdk/contract';
export * as rpc from '@stellar/stellar-sdk/rpc';

if (typeof window !== 'undefined') {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}

export interface Client {
  deposit: (
    { user, amount }: { user: Address; amount: i128 },
    options?: {
      fee?: number;
      timeoutInSeconds?: number;
      simulate?: boolean;
    }
  ) => Promise<AssembledTransaction<null>>;

  withdraw: (
    { user, amount }: { user: Address; amount: i128 },
    options?: {
      fee?: number;
      timeoutInSeconds?: number;
      simulate?: boolean;
    }
  ) => Promise<AssembledTransaction<null>>;

  balance_of: (
    { user }: { user: Address },
    options?: {
      fee?: number;
      timeoutInSeconds?: number;
      simulate?: boolean;
    }
  ) => Promise<AssembledTransaction<i128>>;

  total_deposits: (
    options?: {
      fee?: number;
      timeoutInSeconds?: number;
      simulate?: boolean;
    }
  ) => Promise<AssembledTransaction<i128>>;
}

export class Client extends ContractClient {
  static async deploy<T = Client>(
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        wasmHash: Buffer | string;
        salt?: Buffer | Uint8Array;
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options);
  }

  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([
        "AAAAAAAAAAAAAAAHZGVwb3NpdAAAAAACAAAAAAAAAAR1c2VyAAAAEwAAAAAAAAAGYW1vdW50AAAAAAALAAAAAA==",
        "AAAAAAAAAAAAAAAId2l0aGRyYXcAAAACAAAAAAAAAAR1c2VyAAAAEwAAAAAAAAAGYW1vdW50AAAAAAALAAAAAA==",
        "AAAAAAAAAAAAAAAKYmFsYW5jZV9vZgAAAAAAAQAAAAAAAAAEdXNlcgAAABMAAAABAAAACw==",
        "AAAAAAAAAAAAAAAOdG90YWxfZGVwb3NpdHMAAAAAAAAAAAABAAAACw==",
      ]),
      options
    );
  }

  public readonly fromJSON = {
    deposit: this.txFromJSON<null>,
    withdraw: this.txFromJSON<null>,
    balance_of: this.txFromJSON<i128>,
    total_deposits: this.txFromJSON<i128>,
  };
}
