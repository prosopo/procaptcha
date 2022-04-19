import { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import {randomAsHex} from '@polkadot/util-crypto';

import ProsopoContract from "../api/ProsopoContract";

// TODO import {CaptchaMerkleTree} from '@prosopo/provider-core/merkle';
// import {computeCaptchaSolutionHash, computePendingRequestHash, parseCaptchaDataset} from '../../src/captcha';

import config from "../config";

const { providerApi } = config;

export const getCaptchaChallenge = async (contract: ProsopoContract, account: InjectedAccountWithMeta) : Promise<ProsopoCaptchaResponse> => {
    console.log("ACCOUNT", account.address);
    const randomProvider = await contract.getRandomProvider(account.address);
    console.log("PROVIDER", randomProvider);
    if (!randomProvider) {
        throw new Error("No random provider");
    }
    const captchaPuzzle: ProsopoCaptchaResponse = await providerApi.getCaptchaChallenge(randomProvider);
    console.log("CAPTCHA", captchaPuzzle);
    return captchaPuzzle;
}

// export const solveCaptchaChallenge = async (captchaId: string, solution: number[]) : Promise<any> => {
//     const salt = randomAsHex();
//     const tree = new CaptchaMerkleTree();
//     const captchaSolutionsSalted = [{ captchaId, solution, salt }];
//     const captchasHashed = captchaSolutionsSalted.map((captcha) => computeCaptchaSolutionHash(captcha));

//     tree.build(captchasHashed);
//     const commitmentId = tree.root!.hash;
// }
