// import {Hash} from '@polkadot/types/interfaces';
import ProsopoContractBase from "./ProsopoContractBase";
import {TransactionResponse} from '@redspot/patract/types';
import { Signer } from '@polkadot/api/types';

// TODO: import return types from provider: separate types/common package.
export class ProsopoContract extends ProsopoContractBase {

    public async getRandomProvider(): Promise<ProsopoRandomProviderResponse> {
        return await this.query('getRandomActiveProvider', [this.account.address]) as ProsopoRandomProviderResponse;
    }

    public async dappUserCommit(signer: Signer, dappAccount: string, captchaDatasetId: string, userMerkleTreeRoot: string, providerAddress: string): Promise<TransactionResponse> {
        console.log("userMerkleTreeRoot", userMerkleTreeRoot);
        return await this.transaction(signer, 'dappUserCommit', [dappAccount, captchaDatasetId, userMerkleTreeRoot, providerAddress]);
    }

}

export default ProsopoContract;
