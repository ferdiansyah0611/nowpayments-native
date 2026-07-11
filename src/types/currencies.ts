/**
 * Currency-related types for the NowPayments API.
 */

import type { CryptoCurrency, Money } from "./main.js";

/** Currencies supported by NowPayments (returned as a list of tickers). */
export type CurrenciesResponse = {
  /** Available currency tickers (e.g. `btc`, `eth`, `usdttrc20`). */
  currencies: string[];
};

/** Detailed information about a cryptocurrency (returned by `/v1/full-currencies`). */
export interface FullCurrency {
  /** Internal NowPayments id. */
  id: number;
  /** Currency ticker code (e.g. `AAVE`, `btc`). */
  code: string;
  /** Human-readable name. */
  name: string;
  /** Whether the currency is currently enabled. */
  enable: boolean;
  /** Regex used to validate wallet addresses for this currency. */
  wallet_regex: string;
  /** Display priority (lower = higher priority). */
  priority: number;
  /** Whether an extra id (memo/tag) is required for deposits. */
  extra_id_exists: boolean;
  /** Relative URL to the currency logo. */
  logo_url: string;
  /** Network the currency runs on (e.g. `eth`, `btc`, `trx`). */
  network: string;
}

/** Response wrapper for `GET /v1/full-currencies`. */
export interface FullCurrenciesResponse {
  /** Detailed currency records. */
  currencies: FullCurrency[];
}

/** Parameters for listing available currencies. */
export interface ListCurrenciesParams {
  /**
   * When `true`, only currencies that support fixed-rate exchanges are returned
   * (response includes min/max exchange amounts).
   */
  fixed_rate?: boolean;
}

/** Estimated price for a given currency pair. */
export interface EstimatedPrice {
  /** Source currency ticker. */
  currency_from: CryptoCurrency;
  /** Source amount used for the estimate. */
  amount_from: Money;
  /** Target currency ticker. */
  currency_to: CryptoCurrency;
  /** Estimated amount in the target currency. */
  estimated_amount: Money;
}

/** Minimum payment amount for a currency pair. */
export interface MinimumPaymentAmount {
  /** Source currency ticker. */
  currency_from: CryptoCurrency;
  /** Target currency ticker. */
  currency_to: CryptoCurrency;
  /** Minimum amount in the source currency. */
  min_amount: Money;
}