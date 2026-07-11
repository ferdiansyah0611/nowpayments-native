import type { HttpClient, RequestOptions, QueryParams } from "../http.js";
import type {
  CryptoCurrency,
  GetMinWithdrawalAmountResponse,
  GetWithdrawalFeeResponse,
  ListPayoutsParams,
  PaginatedResponse,
  Payout,
  VerifyBatchWithdrawalPayload,
  VerifyBatchWithdrawalResponse,
} from "../types/index.js";

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
  create(payload: { address: string; currency: CryptoCurrency; amount: number }, options?: RequestOptions): Promise<Payout> {
    return this.http.post<Payout>(
      "/v1/payout",
      payload as unknown as Record<string, unknown>,
      options,
    );
  }

  /** Returns the list of payouts. Requires JWT authentication. */
  list(
    params?: ListPayoutsParams,
    options?: RequestOptions,
  ): Promise<PaginatedResponse<Payout>> {
    return this.http.get<PaginatedResponse<Payout>>(
      "/v1/payout",
      params as QueryParams | undefined,
      options,
    );
  }

  /** Returns a single payout by its id. Requires JWT authentication. */
  get(id: number | string, options?: RequestOptions): Promise<Payout> {
    return this.http.get<Payout>(`/v1/payout/${id}`, undefined, options);
  }

  /**
   * Verifies a batch withdrawal with a 2FA code.
   * Requires JWT authentication.
   */
  verifyBatchWithdrawal(
    batchWithdrawalId: string,
    payload: VerifyBatchWithdrawalPayload,
    options?: RequestOptions,
  ): Promise<VerifyBatchWithdrawalResponse> {
    return this.http.post<VerifyBatchWithdrawalResponse>(
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
  ): Promise<GetMinWithdrawalAmountResponse> {
    return this.http.get<GetMinWithdrawalAmountResponse>(
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
    params: { currency: CryptoCurrency; amount: number },
    options?: RequestOptions,
  ): Promise<GetWithdrawalFeeResponse> {
    return this.http.get<GetWithdrawalFeeResponse>(
      "/v1/payout/fee",
      params as QueryParams,
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