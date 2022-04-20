// import {Hash} from '@polkadot/types/interfaces';
import ProsopoContractBase from "./ProsopoContractBase";
import {TransactionResponse} from '@redspot/patract/types';
import { Signer } from '@polkadot/api/types';

// TODO: import return types from provider: separate types/common package.
class ProsopoContract extends ProsopoContractBase {
    public async getRandomProvider(userAccount: string): Promise<ProsopoRandomProviderResponse | null> {
        return await this.query('getRandomActiveProvider', [userAccount]) as ProsopoRandomProviderResponse;
    }

    public async dappUserCommit(signer: Signer, contractAccount: string, captchaDatasetId: string, userMerkleTreeRoot: string, providerAddress: string): Promise<TransactionResponse> {
        return await this.transaction(signer, 'dappUserCommit', [contractAccount, captchaDatasetId, userMerkleTreeRoot, providerAddress]);
    }

}

export default ProsopoContract;