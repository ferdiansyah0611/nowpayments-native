/**
 * Core types for the NowPayments API.
 * These are shared across all resources.
 */

/** ISO 4217 fiat currency code (e.g. `usd`, `eur`). Treated as a string. */
export type FiatCurrency = string;

/** Crypto asset ticker (e.g. `btc`, `eth`, `usdt`). Treated as a string. */
export type CryptoCurrency = string;

/** A monetary amount. NowPayments accepts strings or numbers; we normalize to string. */
export type Money = string | number;

/** Status of a payment/invoice throughout its lifecycle. */
export type PaymentStatus =
  | "waiting"
  | "confirming"
  | "confirmed"
  | "sending"
  | "partially_paid"
  | "finished"
  | "failed"
  | "refunded"
  | "expired";

/** Generic pagination wrapper returned by list endpoints. */
export interface PaginatedResponse<T> {
  data: T[];
  /** Number of records per page. */
  limit: number;
  /** Current page number. */
  page: number;
  /** Total number of pages. */
  pagesCount: number;
  /** Total number of records. */
  total: number;
}

/** IPN webhook payload for withdrawals (payouts). */
export interface IpnWithdrawalNotification {
  id: string;
  batch_withdrawal_id?: string | null;
  status: string;
  error?: string | null;
  currency: CryptoCurrency;
  amount: Money;
  address: string;
  fee?: Money | null;
  extra_id?: string | null;
  hash?: string | null;
  ipn_callback_url?: string;
  created_at: string;
  requested_at?: string | null;
  updated_at?: string | null;
}

/** IPN webhook payload for custodial recurring payments. */
export interface IpnCustodialRecurringNotification {
  id: string;
  status: string;
  currency: CryptoCurrency;
  amount: Money;
  ipn_callback_url?: string;
  created_at: string;
  updated_at: string;
}

/** Parameters for listing transfers. */
export interface ListTransfersParams {
  /** int or array of int (optional) */
  id?: number | number[];
  status: ListTransfersStatus;
  limit: number;
  offset: number;
  order: 'ASC' | 'DESC';
}

/** Parameters for listing write offs. */
export interface ListWriteOffsParams {
  /** Number of records per page. @default 10 */
  limit?: number;
  /** Page number (0-indexed). @default 0 */
  page?: number;
  /** Sort field. @default "created_at" */
  sortBy?: string;
  /** Sort direction. @default "asc" */
  orderBy?: "asc" | "desc";
  /** Period start date (`YYYY-MM-DD` or ISO 8601). */
  dateFrom?: string;
  /** Period end date (`YYYY-MM-DD` or ISO 8601). */
  dateTo?: string;
}

export type ListTransfersStatus = "WAITING"|"CREATED"|"FINISHED"|"REJECTED";