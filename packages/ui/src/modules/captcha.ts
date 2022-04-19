import ProsopoContract from "../api/ProsopoContract";
import { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
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