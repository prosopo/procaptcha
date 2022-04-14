import ProsopoContract from "./ProsopoContract";
import {createNetwork} from "@prosopo/contract";
import abiJson from "../abi/prosopo.json";

export async function extensionTest() {
  const networkConfig = {'endpoint': 'ws://0.0.0.0:9944'}
  const network = createNetwork('', networkConfig)
  const contract = new ProsopoContract(process.env.CONTRACT_ADDRESS || '', abiJson, network);
  await contract.creationPromise()
  console.log(await contract.getRandomProvider());
}
