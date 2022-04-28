import HttpClientBase from "./HttpClientBase";
import Storage from "../modules/storage";

export class ProviderApi extends HttpClientBase {

  protected config: ProviderApiConfig;

  constructor(config: ProviderApiConfig) {
    super(config['providerApi.baseURL'], config['providerApi.prefix']);
    this.config = config;
  }

  public getConfig<T>(key?: keyof ProviderApiConfig): ProviderApiConfig | T {
    return key ? this.config[key] as unknown as T : this.config;
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
    return this.axios.get(`/provider/captcha/${provider.captchaDatasetId}/${provider.serviceOrigin}/${blockNumber}`);
  }

  public submitCaptchaSolution(blockHash: string, captchas: CaptchaSolution[], requestHash: string, txHash: string, userAccount: string) : Promise<any> {
    const dappAccount = this.config['dappAccount'];
    return this.axios.post(`/provider/solution`, {blockHash, captchas, dappAccount, requestHash, txHash, userAccount});
  }

}

export default ProviderApi;
