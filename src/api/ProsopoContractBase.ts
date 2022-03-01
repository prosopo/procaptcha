import { ApiPromise } from "@polkadot/api";
import { Abi, ContractPromise } from "@polkadot/api-contract";
import abiJson from "../abi/prosopo.json";
import { AbiMessage } from "@polkadot/api-contract/types";
import { blake2AsU8a } from "@polkadot/util-crypto";
import { isHex, isU8a } from "@polkadot/util";
import { AnyJson } from '@polkadot/types/types/codec'
import { ProviderInterface } from "@polkadot/rpc-provider/types";
import Extension, { NoExtensionCallback } from "./Extension";

// TODO: import from provider
export function unwrap(item: AnyJson): AnyJson {
    const prop = 'Ok'
    if (item && typeof (item) === 'object') {
        if (prop in item) {
            return item[prop]
        }
    }
    return item
}

// TODO: import from provider
export function encodeStringArgs<T>(methodObj: AbiMessage, args: T[]): T[] {
    const encodedArgs: T[] = []
    // args must be in the same order as methodObj['args']
    const typesToHash = ['Hash']
    methodObj.args.forEach((methodArg, idx) => {
        const argVal = args[idx]
        // hash values that have been passed as strings
        if (typesToHash.indexOf(methodArg.type.type) > -1 && !(isU8a(argVal) || isHex(argVal))) {
            encodedArgs.push(blake2AsU8a(argVal as unknown as string) as unknown as T)
        } else {
            encodedArgs.push(argVal)
        }
    })
    return encodedArgs
}

// TODO: import from provider
export function getEventNameFromMethodName(contractMethodName: string): string {
    return contractMethodName[0].toUpperCase() + contractMethodName.substring(1)
}

class ProsopoContractBase {
    protected api: ApiPromise;
    protected abi: Abi;
    protected contract: ContractPromise;
    protected isReady = false;
    protected initPromise: Promise<void>;
    public extension: Extension;

    /**
     * @param provider 
     * @param contractAddress 
     * @param noExtCb - callback when no extension was found
     */
    constructor(provider: ProviderInterface, contractAddress: string, noExtCb?: NoExtensionCallback) {
        this.initPromise = new Promise(async (resolve) => {
            this.api = await ApiPromise.create({ provider });
            this.abi = new Abi(abiJson, this.api.registry.getChainProperties());
            this.contract = new ContractPromise(
                this.api,
                this.abi,
                contractAddress
            );
            this.extension = new Extension(noExtCb);
            await this.extension.creationPromise();
            this.isReady = true;
            resolve()
        });
    }

    /**
     * await this to make sure creation completes
     */
    public async creationPromise() {
        await this.initPromise;
        return;
    }

    protected throwIfNotReady() {
        if (!this.isReady) {
            throw new Error("Contract not ready. Try doing: 'await creationPromise()'")
        }
    }

    public async query(method: string, args?: any[]): Promise<AnyJson | null> {
        try {
            this.throwIfNotReady();
            const abiMessage = this.abi.findMessage(method);
            const response = await this.contract.query[method](this.extension.getAccount().address, {}, ...encodeStringArgs(abiMessage, args))
            if (response.result.isOk) {
                if (response.output) {
                    return unwrap(response.output.toHuman())
                } else {
                    return null;
                }
            } else {
                throw new Error(response.result.asErr.asModule.message.unwrap().toString())
            }
        } catch (e) {
            console.log(["ERROR", e])
            return null;
        }
    }

    public async transaction(method: string, args?: any[]) {
        try {
            this.throwIfNotReady();
            const abiMessage = this.abi.findMessage(method);
            const extrinsic = this.contract.tx[method]({}, ...encodeStringArgs(abiMessage, args));

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

            return await extrinsic.signAndSend(this.extension.getAccount().address, { signer: this.extension.getInjected().signer });

        } catch (e) {
            console.log(["ERROR", e])
            return null;
        }
    }
}

export default ProsopoContractBase;