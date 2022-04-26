import { ApiPromise, SubmittableResult } from "@polkadot/api";
import { Abi, ContractPromise } from "@polkadot/api-contract";
import { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";

import abiJson from "../abi/prosopo.json";
import { AnyJson } from "@polkadot/types/types/codec";
import { ProviderInterface } from "@polkadot/rpc-provider/types";
import { unwrap, encodeStringArgs } from "../common/helpers";
import Extension, { NoExtensionCallback } from "./Extension";
import { Signer } from "@polkadot/api/types";
import { buildTx } from "@prosopo/contract";
class ProsopoContractBase {

  protected api: ApiPromise;
  protected abi: Abi;
  protected contract: ContractPromise;
  protected account: InjectedAccountWithMeta;

  public address: string;

  constructor() {
    throw new Error("Use `create` factory method");
  }

  public static async create(...args: any[]) {
    return await Object.create(this.prototype).init(...args);
  }

  /**
   * @param provider
   * @param address
   */
  protected async init(address: string, account: InjectedAccountWithMeta, provider: ProviderInterface) {
    this.api = await ApiPromise.create({ provider });
    this.abi = new Abi(abiJson, this.api.registry.getChainProperties());
    this.contract = new ContractPromise(this.api, this.abi, address);
    this.account = account;
    this.address = address;
    return this;
  }

  public getAccount(): InjectedAccountWithMeta {
    return this.account;
  }

  public getContract(): ContractPromise {
    return this.contract;
  }

  public async query<T>(method: string, args: any[]): Promise<T | AnyJson | null> {
    try {
      const abiMessage = this.abi.findMessage(method);
      const response = await this.contract.query[method](
        this.account.address,
        {},
        ...encodeStringArgs(abiMessage, args)
      );
      if (response.result.isOk) { 
        if (response.output) {
          return unwrap(response.output.toHuman());
        } else {
          return null;
        }
      } else {
        throw new Error(
          response.result.asErr.asModule.message.unwrap().toString()
        );
      }
    } catch (e) {
      console.error("ERROR", e);
      return null;
    }
  }

  public async transaction<T>(signer: Signer, method: string, args: any[]): Promise<T | AnyJson | null | any> {

    const test = await this.query(method, args);

    console.log("query....................", test);

    try {
      const abiMessage = this.abi.findMessage(method);
      const extrinsic = this.contract.tx[method](
        {/* value, gasLimit */}, // https://polkadot.js.org/docs/api-contract/start/contract.tx
        ...encodeStringArgs(abiMessage, args)
      );

      // const response = await buildTx(this.api.registry, extrinsic, this.account.address, { signer });
      // console.log("buildTx RESPONSE", response);
      // return;

      // https://polkadot.js.org/docs/api-contract/start/contract.tx
      return new Promise((resolve) => {

        extrinsic.signAndSend(this.account.address, { signer }, (result: SubmittableResult) => {

          console.log("RESULT", JSON.stringify(result));

          const blockHash = result.status?.asInBlock?.toHex();

          console.log("BLOCK HASH", blockHash);

          console.log("IS FINALIZED", result.status?.isFinalized);

          console.log("IN BLOCK", result.status?.isInBlock);
          if (result.isInBlock) {
            console.log("AS BLOCK", result.status.asInBlock);
          }
          console.log("RESULT HUMAN", result.toHuman());
          console.log("txHash", result.txHash);
          console.log("status", result.status);

          console.log("EVENTS", result.events);

          // https://polkadot.js.org/docs/api/cookbook/tx/
          if (result.status?.isInBlock || result.status?.isFinalized) {
            if (result.events) {
                console.log("EVENTS", result.events);
            }
          }

          resolve(result);

        });

      });

    } catch (e) {
      console.log(["ERROR", e]);
      return null;
    }
  }
}

export default ProsopoContractBase;
