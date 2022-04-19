import { ApiPromise } from "@polkadot/api";
import { Abi, ContractPromise } from "@polkadot/api-contract";
import abiJson from "../abi/prosopo.json";
import { AnyJson } from "@polkadot/types/types/codec";
import { ProviderInterface } from "@polkadot/rpc-provider/types";
import { unwrap, encodeStringArgs } from "../common/helpers";
import Extension, { NoExtensionCallback } from "./Extension";
import { Signer } from "@polkadot/api/types";
class ProsopoContractBase {
  protected api: ApiPromise;
  protected abi: Abi;
  protected contract: ContractPromise;
  protected isReady = false;
  protected initPromise: Promise<void>;

  // protected contractAddress: string;
  // protected accountAddress: string;
  // protected signer: Signer;
  // public extension: Extension;

  /**
   * @param provider
   * @param contractAddress
   * @param noExtCb - callback when no extension was found
   */
  constructor(provider: ProviderInterface, contractAddress: string, accountAddress?: string) {
    
    // this.contractAddress = contractAddress;
    // this.setAccountAddress(accountAddress);

    this.initPromise = new Promise(async (resolve) => {
      this.api = await ApiPromise.create({ provider });
      this.abi = new Abi(abiJson, this.api.registry.getChainProperties());
      this.contract = new ContractPromise(this.api, this.abi, contractAddress);
      // this.extension = new Extension(noExtCb);
      // await this.extension.creationPromise();
      this.isReady = true;
      resolve();
    });
  }

  // public setAccountAddress(accountAddress?: string) {
  //   if (accountAddress) {
  //     this.accountAddress = accountAddress;
  //   }
  // }

  /**
   * await this to make sure creation completes
   */
  public async creationPromise() {
    await this.initPromise;
    return;
  }

  protected throwIfNotReady() {
    if (!this.isReady) {
      throw new Error(
        "Contract not ready. Try doing: 'await creationPromise()'"
      );
    }
  }

  // protected throwIfNotAccount() {
  //   if (!this.accountAddress) {
  //     throw new Error('setAccountAddress() must be called before this');
  //   }
  // }

  public async query<T>(address: string, method: string, args: any[]): Promise<T | AnyJson | null> {
    try {
      this.throwIfNotReady();
      // this.throwIfNotAccount();
      const abiMessage = this.abi.findMessage(method);
      const response = await this.contract.query[method](
        address,
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
    try {
      this.throwIfNotReady();
      const abiMessage = this.abi.findMessage(method);
      const extrinsic = this.contract.tx[method](
        {},
        ...encodeStringArgs(abiMessage, args)
      );

      // await new Promise((resolve) => {
      //     extrinsic.signAndSend(accountId, { signer }, (result) => {
      //         // if (result.status.isRetracted) {
      //         //     throw (result.status.asRetracted)
      //         // }
      //         // if (result.status.isInvalid) {
      //         //     // TODO: not quite sure how these errors work so should be updated later
      //         //     // @ts-ignore
      //         //     throw (result.status.asInvalid)
      //         // }

      //         // console.log(result.toHuman())
      //         // if (result.isInBlock || result.isFinalized) {
      //         //     const eventName = getEventNameFromMethodName(method)
      //         //     // Most contract transactions should return an event
      //         //     if (result.events) {
      //         //         console.log(result.events)
      //         //         // @ts-ignore
      //         //         resolve(result.events.filter((x) => x.name === eventName))
      //         //     }
      //         // }
      //         resolve([])
      //     })
      // });

      return await extrinsic.signAndSend(this.contract.address, {
        signer,
        // signer: this.extension.getInjected().signer
      });
    } catch (e) {
      console.log(["ERROR", e]);
      return null;
    }
  }
}

export default ProsopoContractBase;
