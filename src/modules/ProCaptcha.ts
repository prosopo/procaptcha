import { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import {randomAsHex} from '@polkadot/util-crypto';

import ProsopoContract from "../api/ProsopoContract";

import {CaptchaMerkleTree} from '@prosopo/provider-core';
import {computeCaptchaSolutionHash, computePendingRequestHash, parseCaptchaDataset} from '@prosopo/provider-core';

import config from "../config";
import { Signer } from "@polkadot/api/types";

const { providerApi } = config;

class ProCaptcha {

    protected contract: ProsopoContract;
    protected account: InjectedAccountWithMeta;

    constructor(contract: ProsopoContract, account: InjectedAccountWithMeta) {
        this.contract = contract;
        this.account = account;
    }

    public setAccount(account: InjectedAccountWithMeta) {
        this.account = account;
    }

    public async getCaptchaChallenge(): Promise<ProsopoCaptchaResponse> {
        console.log("ACCOUNT", this.account.address);
        const randomProvider = await this.contract.getRandomProvider(this.account.address);
        console.log("PROVIDER", randomProvider);
        if (!randomProvider) {
            throw new Error("No random provider");
        }
        const captchaPuzzle: ProsopoCaptchaResponse = await providerApi.getCaptchaChallenge(randomProvider);
        console.log("CAPTCHA", captchaPuzzle);
        return captchaPuzzle;
    }

    public async solveCaptchaChallenge(signer: Signer, captchaId: string, datasetId: string, solution: number[]) : Promise<any> {
        const salt = randomAsHex();
        const tree = new CaptchaMerkleTree();
        const captchaSolutionsSalted = [{ captchaId, solution, salt }];
        const captchasHashed = captchaSolutionsSalted.map((captcha) => computeCaptchaSolutionHash(captcha));
    
        tree.build(captchasHashed);
        const commitmentId = tree.root!.hash;
    
        const response = await this.contract.dappUserCommit(
            signer,
            this.contract.getContract().address as unknown as string,
            datasetId as string,
            commitmentId,
            this.account.address,
        );

        console.log("dappUserCommit", response);
    
    }

}

export default ProCaptcha;

