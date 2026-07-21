import type { RequestOptions } from "../http.js";
import type { PaginatedResponse, CryptoCurrency } from "../types/index.js";
import type { Payout } from "../types/payouts.types.js";
import { Resource } from "./main.js";
/**
 * Payout endpoints.
 *
 * - `POST /v1/payout` — create a payout (requires JWT auth).
 * - `GET /v1/payout` — list payouts (requires JWT auth).
 * - `GET /v1/payout/{id}` — get a single payout (requires JWT auth).
 * - `POST /v1/payout/:batch-withdrawal-id/verify` — verify batch withdrawal (JWT).
 * - `GET /v1/payout-withdrawal/min-amount/:coin` — get minimum withdrawal amount (API key).
 * - `GET /v1/payout/fee` — get withdrawal fee (API key).
 * - `POST /v1/payout/:payout_id/cancel` — cancel a payout (JWT).
 * - `POST /v1/payout/:batch_id/cancel-batch` — cancel a payout batch (JWT).
 *
 * Account balances (`GET /v1/balance`) live on {@link PaymentsResource.balance}.
 */
export declare class PayoutsResource extends Resource {
    /**
     * This method is used for crypto payouts only. Please note that payouts can be requested only using a whitelisted IP address,
     * and to whitelisted wallet addresses. It's a security measure enabled for each partner account by default.
     * @requires JWT
     * @requires APIKey
    */
    create(payload: Payout.CreatePayload, options?: RequestOptions): Promise<Payout.CreateResponse>;
    /**
     * This endpoint allows you to get a list of your payouts.
     * @requires APIKey
    */
    list(params?: Payout.ListParams, options?: RequestOptions): Promise<PaginatedResponse<Payout.Payout>>;
    /**
     * Get the actual information about the payout. You need to provide the ID of the payout in the request.
     * @requires APIKey
    */
    get(id: number | string, options?: RequestOptions): Promise<Payout.Payout>;
    /**
     * This method is required to verify payouts by using your 2FA code.
     * You’ll have 10 attempts to verify the payout. If it is not verified after 10 attempts, the payout will remain in ‘creating’ status.
     * Payout will be processed only when it is verified.
     * @requires JWT
     * @requires APIKey
     */
    verifyBatchWithdrawal(batchWithdrawalId: string, payload: Payout.VerifyBatchWithdrawalPayload, options?: RequestOptions): Promise<Payout.VerifyBatchWithdrawalResponse>;
    /**
     * This endpoint shows you current minimal amount for withdrawals.
     * @requires APIKey
     */
    getMinWithdrawalAmount(coin: CryptoCurrency, options?: RequestOptions): Promise<Payout.GetMinWithdrawalAmountResponse>;
    /**
     * This endpoint will show you the estimated amount of network fee for payout.
     * @requires APIKey
     */
    getFee(params?: Payout.FeeParams, options?: RequestOptions): Promise<Payout.FeeResponse>;
    /**
     * This method allows you to cancel a scheduled/recurring payout that was previously created with the execute_at parameter.
     * Only payouts that are scheduled in advance can be canceled using this endpoint.
     * Once canceled, the payout will receive the status cancelled.
     * @requires JWT
     */
    cancel(id: number | string, options?: RequestOptions): Promise<void>;
    /**
     * This endpoint allows you to cancel an entire recurring payout batch.
     * @requires JWT
     */
    cancelBatch(batchId: string, options?: RequestOptions): Promise<void>;
}
//# sourceMappingURL=payouts.d.ts.map