import ProsopoContractBase from "./ProsopoContractBase";


// TODO: import return types from provider
class ProsopoContract extends ProsopoContractBase {
    public getRandomProvider() {
        const userAccount = this.extension.getAccount().address;
        return this.query('getRandomActiveProvider', [userAccount]);
    }
}

export default ProsopoContract;