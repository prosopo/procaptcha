import { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import {randomAsHex} from '@polkadot/util-crypto';
import { blake2AsHex } from '@polkadot/util-crypto';

import ProviderApi from "../api/ProviderApi";
import ProsopoContract from "../api/ProsopoContract";

import {CaptchaSolution, CaptchaMerkleTree} from '@prosopo/provider-core';
// import {computeCaptchaSolutionHash} from '@prosopo/provider-core'; // TODO

import { Signer } from "@polkadot/api/types";
import { TransactionResponse } from "../types/contract";


function hexHash(data: string | Uint8Array): string {
    return blake2AsHex(data);
}

function computeCaptchaSolutionHash(captcha: CaptchaSolution) {
    return hexHash([captcha.captchaId, captcha.solution, captcha.salt].join());
}

export class ProCaptcha {

    protected contract: ProsopoContract;
    protected provider: ProsopoRandomProviderResponse;
    protected providerApi: ProviderApi;

    constructor(contract: ProsopoContract, provider: ProsopoRandomProviderResponse, providerApi: ProviderApi) {
        this.contract = contract;
        this.provider = provider;
        this.providerApi = providerApi;
    }

    public async getCaptchaChallenge(): Promise<ProsopoCaptchaResponse> {
        // console.log("ACCOUNT", this.contract.getAccount().address);
        // const randomProvider = await this.contract.getRandomProvider(this.contract.getAccount().address);
        const captchaPuzzle: ProsopoCaptchaResponse = await this.providerApi.getCaptchaChallenge(this.provider);
        console.log("CAPTCHA", captchaPuzzle);
        return captchaPuzzle;
    }

    public async solveCaptchaChallenge(signer: Signer, requestHash: string, captchaId: string, datasetId: string, solution: number[]) : Promise<Partial<TransactionResponse>> {
        const salt = randomAsHex();
        const tree = new CaptchaMerkleTree();
        const captchaSolutionsSalted: CaptchaSolution[] = [{ captchaId, solution, salt }];
        const captchasHashed = captchaSolutionsSalted.map((captcha) => computeCaptchaSolutionHash(captcha));

        tree.build(captchasHashed);
        const commitmentId = tree.root!.hash;

        console.log("commitmentId", commitmentId);
        console.log("solveCaptchaChallenge ACCOUNT", this.contract.getAccount().address);
        console.log("solveCaptchaChallenge ADDRESS", this.contract.address);

        // const dappAccount = this.providerApi.getConfig('dappAccount') as string;

        const tx = await this.contract.dappUserCommit(
            signer,
            datasetId as string,
            commitmentId,
            this.provider.providerId,
        );

        console.log("TRANSACTION", tx);

        const submit = await this.providerApi.submitCaptchaSolution(tx.blockHash, captchaSolutionsSalted, requestHash, tx.txHash.toString(), this.contract.getAccount().address);

        console.log("SUBMIT", submit);

        // submitCaptchaSolution(blockHash: string, captchas: number[], dappAccount: string, requestHash: string, txHash: string, userAccount: string) : Promise<any> {

        return tx;
    }

}

export default ProCaptcha;

