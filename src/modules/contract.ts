import ProsopoContract from "../api/ProsopoContract";
import { HttpProvider } from "@polkadot/rpc-provider";
import { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";

export async function getProsopoContract(address: string, account: InjectedAccountWithMeta, providerInterface?: HttpProvider): Promise<ProsopoContract> {
    return await ProsopoContract.create(address, account, providerInterface ?? new HttpProvider());
}
