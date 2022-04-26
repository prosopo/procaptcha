import { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import {randomAsHex} from '@polkadot/util-crypto';
import { blake2AsHex } from '@polkadot/util-crypto';

import ProsopoContract from "../api/ProsopoContract";

import {CaptchaSolution, CaptchaMerkleTree} from '@prosopo/provider-core';
// import {computeCaptchaSolutionHash} from '@prosopo/provider-core'; // TODO

import config from "../config";
import { Signer } from "@polkadot/api/types";

const { providerApi } = config;

function hexHash(data: string | Uint8Array): string {
    return blake2AsHex(data);
}

function computeCaptchaSolutionHash(captcha: CaptchaSolution) {
    return hexHash([captcha.captchaId, captcha.solution, captcha.salt].join());
}

class ProCaptcha {

    protected contract: ProsopoContract;

    constructor(contract: ProsopoContract) {
        this.contract = contract;
    }

    public async getRandomProvider(): Promise<ProsopoRandomProviderResponse> {
        return await this.contract.getRandomProvider(this.contract.getAccount().address);
    }

    public async getCaptchaChallenge(provider: ProsopoRandomProviderResponse): Promise<ProsopoCaptchaResponse> {
        // console.log("ACCOUNT", this.contract.getAccount().address);
        // const randomProvider = await this.contract.getRandomProvider(this.contract.getAccount().address);
        console.log("PROVIDER", provider);
        const captchaPuzzle: ProsopoCaptchaResponse = await providerApi.getCaptchaChallenge(provider);
        console.log("CAPTCHA", captchaPuzzle);
        return captchaPuzzle;
    }

    public async solveCaptchaChallenge(signer: Signer, provider: string, captchaId: string, datasetId: string, solution: number[]) : Promise<any> {
        const salt = randomAsHex();
        const tree = new CaptchaMerkleTree();
        const captchaSolutionsSalted = [{ captchaId, solution, salt }];
        const captchasHashed = captchaSolutionsSalted.map((captcha) => computeCaptchaSolutionHash(captcha));
    
        tree.build(captchasHashed);
        const commitmentId = tree.root!.hash;

        console.log("solveCaptchaChallenge ACCOUNT", this.contract.getAccount().address);

        console.log("solveCaptchaChallenge ADDRESS", this.contract.address);
    
        const response = await this.contract.dappUserCommit(
            signer,
            config.dappAccount,
            // this.contract.getAccount().address,
            datasetId as string,
            commitmentId,
            provider,
        );

        return response;
    }

}

export default ProCaptcha;

