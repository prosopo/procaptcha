import HttpClientBase from "./HttpClientBase";
import Storage from "../modules/storage";

export class ProviderApi extends HttpClientBase {

  protected config: ProsopoConfig;

  constructor(config: ProsopoConfig) {
    super(config['providerApi.baseURL'], config['providerApi.prefix']);
    this.config = config;
  }

  /**
   * 
   * @deprecated use ProsopoContract$getRandomProvider instead.
   */
  public getRandomProvider() {
    const userAccount = Storage.getAccount();
    return this.axios.get(`/random_provider/${userAccount}`);
  }

  public getContractAddress(): Promise<{contractAddress: string}> {
    return this.axios.get(`/contract_address`);
  }

  public getProviders(): Promise<{accounts: string[]}> {
    return this.axios.get(`/providers`);
  }

  public getCaptchaChallenge(randomProvider: ProsopoRandomProviderResponse) : Promise<ProsopoCaptchaResponse> {
    let { provider, blockNumber } = randomProvider;
    blockNumber = blockNumber.replace(/,/g, ''); // TODO: middleware schema parser/validator.
    const dappAccount = this.config['dappAccount'];
    return this.axios.get(`/provider/captcha/${provider.captchaDatasetId}/${provider.serviceOrigin}/${dappAccount}/${blockNumber}`);
  }

  public submitCaptchaSolution(blockHash: string, captchas: CaptchaSolution[], requestHash: string, txHash: string, userAccount: string) : Promise<any> {
    const dappAccount = this.config['dappAccount'];
    return this.axios.post(`/provider/solution`, {blockHash, captchas, dappAccount, requestHash, txHash, userAccount});
  }

}

export default ProviderApi;
