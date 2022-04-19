import ProsopoContract from "../api/ProsopoContract";
import Extension from "../api/Extension";
import { HttpProvider } from "@polkadot/rpc-provider";

// export ProsopoContract from "./ProsopoContract";

export async function getProsopoContract(contractAddress: string) {
    const contract = new ProsopoContract(new HttpProvider(), contractAddress);
    await contract.creationPromise();
    return contract;
}

export async function getExtension() {
    const extension = new Extension();
    await extension.creationPromise();
    return extension;
}
