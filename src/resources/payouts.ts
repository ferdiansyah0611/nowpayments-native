import type { HttpClient, RequestOptions, QueryParams } from "../http.js";
import type {
  PaginatedResponse,
  CryptoCurrency,
} from "../types/index.js";
import type { Payout } from "../types/payouts.types.js";

/** Base class for resource groups — holds a reference to the HTTP client. */
abstract class Resource {
  protected readonly http: HttpClient;
  constructor(http: HttpClient) {
    this.http = http;
  }
}

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
  /** Creates a new payout (withdrawal). Requires JWT authentication. */
  create(payload: { address: string; currency: CryptoCurrency; amount: number }, options?: RequestOptions): Promise<Payout.Payout> {
    return this.http.post<Payout.Payout>(
      "/v1/payout",
      payload as unknown as Record<string, unknown>,
      options,
    );
  }

  /** Returns the list of payouts. Requires JWT authentication. */
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

  /** Returns a single payout by its id. Requires JWT authentication. */
  get(id: number | string, options?: RequestOptions): Promise<Payout.Payout> {
    return this.http.get<Payout.Payout>(`/v1/payout/${id}`, undefined, options);
  }

  /**
   * Verifies a batch withdrawal with a 2FA code.
   * Requires JWT authentication.
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
   * Gets the minimum withdrawal amount for a specific coin.
   * Requires API key authentication.
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
   * Gets the withdrawal fee for a specific currency and amount.
   * Requires API key authentication.
   */
  getFee(
    params: Payout.FeeParams,
    options?: RequestOptions,
  ): Promise<Payout.FeeResponse> {
    return this.http.get<Payout.FeeResponse>(
      "/v1/payout/fee",
      params as unknown as QueryParams,
      options,
    );
  }

  /**
   * Cancels a payout by its id.
   * Requires JWT authentication.
   */
  cancel(id: number | string, options?: RequestOptions): Promise<void> {
    return this.http.delete<void>(`/v1/payout/${id}`, undefined, options);
  }

  /**
   * Cancels a payout batch by its batch ID.
   * Requires JWT authentication.
   */
  cancelBatch(batchId: string, options?: RequestOptions): Promise<void> {
    return this.http.delete<void>(`/v1/payout/${batchId}/cancel-batch`, undefined, options);
  }
}