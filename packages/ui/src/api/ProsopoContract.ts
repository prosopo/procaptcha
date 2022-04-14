import {ProsopoContractApi, Network} from "@prosopo/contract";
import Extension, {NoExtensionCallback} from "./Extension";
import {Abi} from "@polkadot/api-contract";

// TODO: import return types from provider
class ProsopoContract extends ProsopoContractApi {
    public extension: Extension;
    protected initPromise: Promise<void>;

    constructor(
        contractAddress: string,
        abiJson: Record<any, any>,
        network: Promise<Network>,
        noExtCb?: NoExtensionCallback
    ) {
        const abi = new Abi(abiJson);
        super(contractAddress, '', abi, network);
        this.extension = new Extension(noExtCb);
        this.initPromise = new Promise(async (resolve) => {
            await this.isReady();
            this.extension = new Extension(noExtCb);
            await this.extension.creationPromise();
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

    public async getExtension() {
        await this.extension.creationPromise();
    }

    public getRandomProvider() {
        const userAccount = this.extension.getAccount().address;
        return this.contractQuery('getRandomActiveProvider', [userAccount]);
    }

    public providerRegister(serviceOrigin, fee, payee, address) {
        return this.contractTx('getRandomActiveProvider', [serviceOrigin, fee, payee, address]);
    }
}


export default ProsopoContract;
