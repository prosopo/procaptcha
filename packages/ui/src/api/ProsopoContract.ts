import ProsopoContractBase from "./ProsopoContractBase";
import ProviderApi from "./providerApi";

const providerApi = new ProviderApi("http://localhost:3000", "/v1/prosopo");

// TODO: import return types from provider
class ProsopoContract extends ProsopoContractBase {
    public async getRandomProvider(userAccount?: string): Promise<ProsopoRandomProviderResponse | null> {
        return await this.query('getRandomActiveProvider', [userAccount || this.extension.getAccount().address]) as ProsopoRandomProviderResponse;
    }
}

export default ProsopoContract;