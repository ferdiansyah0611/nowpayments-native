/**
 * Payout (withdrawal) types for the NowPayments API.
 */

import type { CryptoCurrency, Money } from "./main.types.js";

export namespace Payout {
  /** Payout (withdrawal) record. */
  export interface Payout {
    id: number;
    amount: Money;
    currency: CryptoCurrency;
    address: string;
    status: "CREATED" | "PROCESSING" | "DONE" | "FAILED" | "WAITING_FOR_CONFIRMATION";
    txHash?: string;
    createdAt: string;
    updatedAt: string;
    batch?: boolean;
    fee?: Money;
  }

  /** Payload to create a payout. */
  export interface CreatePayload {
    address: string;
    currency: CryptoCurrency;
    amount: Money;
    extra_id?: string;
    ipn_callback_url?: string;
    batch?: boolean;
    subtract?: boolean;
  }

  /** Payload to validate a payout address (`POST /v1/payout/validate-address`). */
  export interface ValidateAddressPayload {
    /** The payout address to validate. */
    address: string;
    /** Currency ticker the address belongs to (e.g. `eth`). */
    currency: CryptoCurrency;
    /** Extra id / memo / tag, when applicable. */
    extra_id?: string | null;
  }

  /** Response from `POST /v1/payout/validate-address`. */
  export interface ValidateAddressResponse {
    /** Whether the address is valid. */
    status: boolean;
    /** HTTP-style status code returned by the API. */
    statusCode?: number;
    /** Human-readable message describing the result. */
    message?: string;
  }

  /** Payload to verify a batch withdrawal (`POST /v1/payout/:batch-withdrawal-id/verify`). */
  export interface VerifyBatchWithdrawalPayload {
    /** 2FA code from Google Auth app or email. */
    verification_code: string;
  }

  /** Response from `POST /v1/payout/:batch-withdrawal-id/verify`. */
  export interface VerifyBatchWithdrawalResponse {
    /** Success message. */
    result: string;
  }

  /** Parameters for listing payouts. */
  export interface ListParams {
    /** Batch ID of enlisted payouts. */
    batch_id?: string;
    /** Statuses of enlisted payouts. */
    status?: string;
    /** Sort field. */
    order_by?: "id" | "batchId" | "dateCreated" | "dateRequested" | "dateUpdated" | "currency" | "status";
    /** Sort direction. */
    order?: "asc" | "desc";
    /** Beginning date of the requested payouts. */
    date_from?: string;
    /** Ending date of the requested payouts. */
    date_to?: string;
    /** Number of results to show. */
    limit?: number;
    /** Current page. */
    page?: number;
  }

  /** Response from `GET /v1/payout-withdrawal/min-amount/:coin`. */
  export interface GetMinWithdrawalAmountResponse {
    /** Whether the request was successful. */
    success: boolean;
    /** Minimum withdrawal amount for the specified coin. */
    result: number;
  }

  /** Response from `GET /v1/payout/fee`. */
  export interface GetFeeResponse {
    /** Currency. */
    currency: CryptoCurrency;
    /** Withdrawal fee. */
    fee: number;
  }

  export interface FeeParams {
    currency: string;
    amount: number;
  }

  export interface FeeResponse {
    currency: string;
    fee: number;
  }
}