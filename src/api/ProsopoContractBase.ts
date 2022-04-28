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
import { contractDefinitions } from "@prosopo/contract";
import AsyncFactory from "./AsyncFactory";
export class ProsopoContractBase extends AsyncFactory {

  protected api: ApiPromise;
  protected abi: Abi;
  protected contract: ContractPromise;
  protected account: InjectedAccountWithMeta;

  public address: string;

  /**
   * @param address
   * @param account
   * @param providerInterface
   */
  public async init(address: string, account: InjectedAccountWithMeta, providerInterface: ProviderInterface) {
    this.api = await ApiPromise.create({ provider: providerInterface });
    this.abi = new Abi(abiJson, this.api.registry.getChainProperties());
    //await this.api.registry.register(contractDefinitions);
    this.contract = new ContractPromise(this.api, this.abi, address);
    this.account = account;
    this.address = address;
    return this;
  }

  public getApi(): ApiPromise {
    return this.api;
  }

  public getContract(): ContractPromise {
    return this.contract;
  }

  public getAccount(): InjectedAccountWithMeta {
    return this.account;
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

    const queryBeforeTx = await this.query(method, args);

    console.log("QUERY BEFORE TX....................", queryBeforeTx);

    const abiMessage = this.abi.findMessage(method);

    // https://polkadot.js.org/docs/api-contract/start/contract.tx
    const extrinsic = this.contract.tx[method]({/* value, gasLimit */}, ...encodeStringArgs(abiMessage, args));

    this.api.setSigner(signer);

    try {
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

        }).catch((error) => {
          throw error.error || error;
        });

      });

    } catch (e) {
      console.log(["ERROR", e]);
      return null;
    }
  }
}

export default ProsopoContractBase;
