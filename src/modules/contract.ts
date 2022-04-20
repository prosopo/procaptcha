import ProsopoContract from "../api/ProsopoContract";
import { HttpProvider } from "@polkadot/rpc-provider";

export async function getProsopoContract(address: string) {
    return await ProsopoContract.create(new HttpProvider(), address);
}
