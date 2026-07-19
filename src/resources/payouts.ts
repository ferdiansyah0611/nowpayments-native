import type { RequestOptions, QueryParams } from "../http.js";
import type {
  PaginatedResponse,
  CryptoCurrency,
} from "../types/index.js";
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
export class PayoutsResource extends Resource {
  /**
   * This method is used for crypto payouts only. Please note that payouts can be requested only using a whitelisted IP address, 
   * and to whitelisted wallet addresses. It's a security measure enabled for each partner account by default.
   * @requires JWT
   * @requires APIKey
  */
  create(payload: Payout.CreatePayload, options?: RequestOptions): Promise<Payout.CreateResponse> {
    return this.http.post<Payout.CreateResponse>(
      "/v1/payout",
      JSON.stringify(payload) as unknown as Record<string, unknown>,
      options,
    );
  }

  /**
   * This endpoint allows you to get a list of your payouts.
   * @requires APIKey
  */
  list(
    params?: Payout.ListParams,
    options?: RequestOptions,
  ): Promise<PaginatedResponse<Payout.Payout>> {
    return this.http.get<PaginatedResponse<Payout.Payout>>(
      "/v1/payout",
      params as QueryParams | undefined,
      options,
    );
  }

  /**
   * Get the actual information about the payout. You need to provide the ID of the payout in the request.
   * @requires APIKey
  */
  get(id: number | string, options?: RequestOptions): Promise<Payout.Payout> {
    return this.http.get<Payout.Payout>(`/v1/payout/${id}`, undefined, options);
  }

  /**
   * This method is required to verify payouts by using your 2FA code.
   * You’ll have 10 attempts to verify the payout. If it is not verified after 10 attempts, the payout will remain in ‘creating’ status.
   * Payout will be processed only when it is verified.
   * @requires JWT
   * @requires APIKey
   */
  verifyBatchWithdrawal(
    batchWithdrawalId: string,
    payload: Payout.VerifyBatchWithdrawalPayload,
    options?: RequestOptions,
  ): Promise<Payout.VerifyBatchWithdrawalResponse> {
    return this.http.post<Payout.VerifyBatchWithdrawalResponse>(
      `/v1/payout/${batchWithdrawalId}/verify`,
      payload as unknown as Record<string, unknown>,
      options,
    );
  }

  /**
   * This endpoint shows you current minimal amount for withdrawals.
   * @requires APIKey
   */
  getMinWithdrawalAmount(
    coin: CryptoCurrency,
    options?: RequestOptions,
  ): Promise<Payout.GetMinWithdrawalAmountResponse> {
    return this.http.get<Payout.GetMinWithdrawalAmountResponse>(
      `/v1/payout-withdrawal/min-amount/${coin}`,
      undefined,
      options,
    );
  }

  /**
   * This endpoint will show you the estimated amount of network fee for payout.
   * @requires APIKey
   */
  getFee(
    params?: Payout.FeeParams,
    options?: RequestOptions,
  ): Promise<Payout.FeeResponse> {
    return this.http.get<Payout.FeeResponse>(
      "/v1/payout/fee",
      params as unknown as QueryParams,
      options,
    );
  }

  /**
   * This method allows you to cancel a scheduled/recurring payout that was previously created with the execute_at parameter. 
   * Only payouts that are scheduled in advance can be canceled using this endpoint. 
   * Once canceled, the payout will receive the status cancelled.
   * @requires JWT
   */
  cancel(id: number | string, options?: RequestOptions): Promise<void> {
    return this.http.post<void>(`/v1/payout/${id}/cancel`, undefined, options);
  }

  /**
   * This endpoint allows you to cancel an entire recurring payout batch.
   * @requires JWT
   */
  cancelBatch(batchId: string, options?: RequestOptions): Promise<void> {
    return this.http.post<void>(`/v1/payout/${batchId}/cancel-batch`, undefined, options);
  }
}