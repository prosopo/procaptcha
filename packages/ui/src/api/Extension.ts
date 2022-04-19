import {
    web3Enable,
    web3FromSource,
    web3Accounts,
} from "@polkadot/extension-dapp";
import { InjectedAccountWithMeta, InjectedExtension } from "@polkadot/extension-inject/types"
import { SignerPayloadRaw } from "@polkadot/types/types";
import storage from "../modules/storage";

/**
 * type for callback when no extension was found
 */
export type NoExtensionCallback = () => void | Promise<void>;

class Extension {
    private initPromise: Promise<void>;
    private isReady = false;
    private account: InjectedAccountWithMeta;
    private injected: InjectedExtension;
    private allAccounts: InjectedAccountWithMeta[];

    /**
     * @param noExtCb - callback when no extension was found
     */
    constructor(noExtCb?: NoExtensionCallback) {
        this.initPromise = new Promise(async (resolve) => {
            await this.checkExtensions(noExtCb || (() => { }));
            this.allAccounts = await web3Accounts();
            await this._loadAccount();
            console.log(this.account)
            this.injected = await web3FromSource(this.account.meta.source);
            this.isReady = true;
            resolve()
        })
    }

    /**
     * await this to make sure creation completes
     */
    public async creationPromise() {
        await this.initPromise;
        return;
    }

    private throwIfNotReady() {
        if (!this.isReady) {
            throw new Error("Extension not ready. Try doing: 'await creationPromise()'")
        }
    }

    private async waitAndThrowIfNotReady() {
        await this.initPromise;
        this.throwIfNotReady();
    }

    public async checkExtensions(cb: NoExtensionCallback, compatInits?: (() => Promise<boolean>)[]) {
        // this call fires up the authorization popup
        const extensions = await web3Enable('Prosopo', compatInits);

        if (extensions.length === 0) {
            // no extension installed, or the user did not accept the authorization
            // in this case we should inform the use and give a link to the extension
            await cb();
            return;
        }
    }

    private async _loadAccount() {
        const defaultAccount = storage.getAccount();

        const account = this.allAccounts.find(acc => acc.address === defaultAccount)

        return this.account = account || this.allAccounts[0];
    }

    public async loadAccount() {
        await this.waitAndThrowIfNotReady();
        return this._loadAccount();
    }

    public async setAccount(address: string): Promise<InjectedAccountWithMeta> {
        await this.waitAndThrowIfNotReady();
        const account = this.allAccounts.find(acc => acc.address === address);
        if (!account) {
            throw new Error("Account doesn't exist")
        }
        storage.setAccount(address);
        return this.account = account;
    }

    public getAccount() {
        this.throwIfNotReady();
        return this.account;
    }

    public getAllAcounts() {
        this.throwIfNotReady();
        return this.allAccounts;
    }

    public getInjected() {
        this.throwIfNotReady();
        return this.injected;
    }

    public async signRaw(raw: Omit<SignerPayloadRaw, "address">) {
        await this.waitAndThrowIfNotReady();
        return (this.injected.signer && this.injected.signer.signRaw && this.injected.signer.signRaw({
            address: this.account.address,
            ...raw
        }))
    }
}

export default Extension;
