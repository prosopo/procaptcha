import HttpClientBase from "./httpClientBase";
import Storage from "./storage";

class ProviderApi extends HttpClientBase {
  private getRandomProviderAPI = "/v1/prosopo/random_provider";
  private getCaptchaPuzzleAPI = "/v1/prosopo/provider/captcha";

  public getRandomProvider() {
    const userAccount = Storage.getAccount();
    return this.instance.get(`${this.getRandomProviderAPI}/${userAccount}`);
  }

  public getCaptchaPuzzle(
    datasetId: string,
    userAccount: string,
    blockNumber: string
  ) {
    return this.instance.get(
      `${this.getCaptchaPuzzleAPI}/${datasetId}/${userAccount}/${parseInt(
        blockNumber.replace(/,/g, "")
      )}`
    );
  }
}

export default ProviderApi;
