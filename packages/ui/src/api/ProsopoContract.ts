import ProsopoContractBase from "./ProsopoContractBase";

// TODO: import return types from provider
class ProsopoContract extends ProsopoContractBase {
    public async getRandomProvider() {
        // console.log("CONTRACT", this.contract);
        // const userAccount = this.extension.getAccount().address;
        const userAccount = this.contract.address;
        console.log("USER", userAccount);
        return await this.query('getRandomActiveProvider', [userAccount]);
    }
}

export default ProsopoContract;