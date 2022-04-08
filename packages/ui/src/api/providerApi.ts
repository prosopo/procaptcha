import HttpClientBase from "./httpClientBase";
import Storage from "./storage";

class ProviderApi extends HttpClientBase {

  /**
   * 
   * @deprecated use ProsopoContract$getRandomProvider instead.
   */
  public getRandomProvider() {
    const userAccount = Storage.getAccount();
    return this.instance.get(`/random_provider/${userAccount}`);
  }

  public getContractAddress(): Promise<{contractAddress: string}> {
    return this.instance.get(`/contract_address`);
  }

  public getProviders(): Promise<{accounts: string[]}> {
    return this.instance.get(`/providers/`);
  }

  public getCaptchaPuzzle(
    datasetId: string,
    userAccount: string,
    blockNumber: string
  ) {
    return this.instance.get(
      `/provider/captcha/${datasetId}/${userAccount}/${parseInt(
        blockNumber.replace(/,/g, "")
      )}`
    );
  }
}

export default ProviderApi;
