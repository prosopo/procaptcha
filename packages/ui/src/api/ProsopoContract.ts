import ProsopoContractBase from "./ProsopoContractBase";

// TODO: import return types from provider: separate types/common package.
class ProsopoContract extends ProsopoContractBase {
    public async getRandomProvider(userAccount: string): Promise<ProsopoRandomProviderResponse | null> {
        return await this.query(userAccount, 'getRandomActiveProvider', [userAccount]) as ProsopoRandomProviderResponse;
    }
}

export default ProsopoContract;