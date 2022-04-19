import {
  web3Accounts,
  web3Enable,
  web3FromSource,
} from "@polkadot/extension-dapp";
import { HttpProvider } from "@polkadot/rpc-provider";
import { blake2AsHex } from "@polkadot/util-crypto";
import ProsopoContract from "./ProsopoContract";

export async function extensionTest() {
  const contract = new ProsopoContract(new HttpProvider(), "5EFDQKSZeWLNZySoHb1JGT89AajKJECmBnZ7HasdYWqbyeaT");
  await contract.creationPromise();

  // console.log(await contract.getRandomProvider());

  // console.log(blake2AsHex("http://localhost:8282"))
  // console.log(await contract.transaction("providerRegister", [blake2AsHex("http://localhost:8282"), 0, "Provider", "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"]))
}


export async function getProsopoContract(contractAddress: string) {

  const contract = new ProsopoContract(new HttpProvider(), contractAddress);
  await contract.creationPromise();

  return contract;
}