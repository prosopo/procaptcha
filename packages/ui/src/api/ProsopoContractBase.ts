import {ApiPromise} from "@polkadot/api";
import {Abi, ContractPromise} from "@polkadot/api-contract";
import abiJson from "../abi/prosopo.json";
import {AnyJson} from "@polkadot/types/types/codec";
import {ProviderInterface} from "@polkadot/rpc-provider/types";
import {
    unwrap,
    encodeStringArgs,
} from "@prosopo/contract";
import Extension, {NoExtensionCallback} from "./Extension";
import {AbiMessage} from "@polkadot/api-contract/types";

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
    constructor(
        provider: ProviderInterface,
        contractAddress: string,
        noExtCb?: NoExtensionCallback
    ) {
        this.initPromise = new Promise(async (resolve) => {
            this.api = await ApiPromise.create({provider});
            this.abi = new Abi(abiJson, this.api.registry.getChainProperties());
            this.contract = new ContractPromise(this.api, this.abi, contractAddress);
            this.extension = new Extension(noExtCb);
            await this.extension.creationPromise();
            this.isReady = true;
            resolve();
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
            throw new Error(
                "Contract not ready. Try doing: 'await creationPromise()'"
            );
        }
    }

    public async query(method: string, args: any[]): Promise<AnyJson | null> {
        try {
            this.throwIfNotReady();
            const abiMessage: AbiMessage = this.abi.findMessage(method);
            const response = await this.contract.query[method](
                this.extension.getAccount().address,
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
            console.log(["ERROR", e]);
            return null;
        }
    }

    public async transaction(method: string, args: any[]) {
        try {
            this.throwIfNotReady();
            console.log(args)
            const abiMessage = this.abi.findMessage(method);
            console.log(abiMessage);
            console.log(...encodeStringArgs(abiMessage, args));
            const extrinsic = this.contract.tx[method](
                {},
                ...encodeStringArgs(abiMessage, args)
            );


            return await extrinsic.signAndSend(this.extension.getAccount().address, {
                signer: this.extension.getInjected().signer
            });
        } catch (e) {
            console.log(["ERROR", e]);
            return null;
        }
    }
}



export default ProsopoContractBase;
