// import { SubmittableResult } from "@polkadot/api";

import type { DispatchError, DispatchInfo, EventRecord, ExtrinsicStatus, Hash } from '@polkadot/types/interfaces';
import type { SubmittableResultValue } from '@polkadot/api/types';

export declare class TransactionResponse implements SubmittableResultValue {
    dispatchError?: DispatchError;
    dispatchInfo?: DispatchInfo;
    events?: EventRecord[];
    internalError?: Error;
    status: ExtrinsicStatus;
    txHash: Hash;
    txIndex?: number;
    blockHash: string;
}
