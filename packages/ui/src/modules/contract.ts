import ProsopoContract from "../api/ProsopoContract";
import { HttpProvider } from "@polkadot/rpc-provider";

// export ProsopoContract from "./ProsopoContract";

export async function getProsopoContract(contractAddress: string) {

    const contract = new ProsopoContract(new HttpProvider(), contractAddress);
    await contract.creationPromise();

    return contract;
}