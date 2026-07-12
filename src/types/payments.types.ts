/**
 * Payment-related types for the NowPayments API.
 */

import type {
  CryptoCurrency,
  FiatCurrency,
  Money,
  PaymentStatus,
} from "./main.types.js";

export namespace Payment {
  /** A single payment record returned by NowPayments. */
  export interface Payment {
    payment_id: number;
    payment_status: PaymentStatus;
    pay_address: string;
    pay_amount: Money;
    actually_paid?: Money;
    actually_paid_at_fiat?: Money;
    pay_currency: CryptoCurrency;
    price_amount: Money;
    price_currency: FiatCurrency;
    order_id: string | null;
    order_description: string | null;
    purchase_id: string | null;
    outcome_amount?: Money;
    outcome_currency?: CryptoCurrency;
    payin_extra_id?: string | null;
    payin_hash?: string;
    payout_hash?: string;
    parent_payment_id?: number | null;
    invoice_id?: string | null;
    payment_extra_ids?: string | null;
    created_at: string;
    updated_at: string;
    burning_percent?: number;
    fee?: Fee;
    network?: string;
    result_url?: string;
    unfix_address_url?: string;
    ipn_callback_url?: string;
    partially_paid_url?: string;
    underpaid_url?: string;
    overpaid_url?: string;
  }

  /** Fee breakdown returned in payment records and IPN webhooks. */
  export interface Fee {
    /** Currency the fees are denominated in. */
    currency?: CryptoCurrency;
    /** Deposit fee applied to the payment. */
    depositFee?: number;
    /** Withdrawal fee applied to the payment. */
    withdrawalFee?: number;
    /** Service fee applied to the payment. */
    serviceFee?: number;
  }

  /** Payload to create a new payment. */
  export interface CreatePayload {
    /** Fiat equivalent of the price to be paid in crypto. */
    price_amount: Money;
    /** Fiat currency in which the price_amount is specified (usd, eur, etc). */
    price_currency: FiatCurrency;
    /** Amount that users have to pay for the order stated in crypto. */
    pay_amount?: Money;
    /** Crypto currency in which the pay_amount is specified (btc, eth, etc). */
    pay_currency: CryptoCurrency;
    /** Url to receive callbacks, should contain "http" or "https". */
    ipn_callback_url?: string;
    /** Inner store order ID, e.g. "RGDBP-21314". */
    order_id?: string;
    /** Inner store order description, e.g. "Apple Macbook Pro 2019 x 1". */
    order_description?: string;
    /** Id of purchase for which you want to create another payment. */
    purchase_id?: string;
    /** External payout address (overrides the one in your Personal account). */
    payout_address?: string;
    /** Currency of your external payout_address (required with payout_address). */
    payout_currency?: CryptoCurrency;
    /** Extra id or memo or tag for external payout_address. */
    payout_extra_id?: string;
    /** Boolean. Required for fixed-rate exchanges. */
    fixed_rate?: boolean;
    /** Whether the exchange rate is fixed for the payment. */
    is_fixed_rate?: boolean;
    /** Whether the exchange fee is paid by the user. */
    is_fee_paid_by_user?: boolean;
  }

  /** Invoice record returned by NowPayments. */
  export interface Invoice {
    id: number;
    order_id: string;
    order_description: string;
    price_amount: Money;
    price_currency: FiatCurrency;
    pay_currency: CryptoCurrency | null;
    ipn_callback_url: string;
    invoice_url: string;
    success_url: string;
    cancel_url: string;
    created_at: string;
    updated_at: string;
  }

  /** Payload to create an invoice. */
  export interface CreateInvoicePayload {
    /** Amount to pay in fiat currency. Auto-converted to crypto if pay_currency omitted. */
    price_amount: Money;
    /** Fiat currency in which the price_amount is specified (usd, eur, etc). */
    price_currency: FiatCurrency;
    /** Crypto currency in which the pay_amount is specified. If omitted, choosable on the invoice_url. */
    pay_currency?: CryptoCurrency;
    /** Url to receive callbacks, should contain "http" or "https". */
    ipn_callback_url?: string;
    /** Inner store order ID, e.g. "RGDBP-21314". */
    order_id?: string;
    /** Inner store order description, e.g. "Apple Macbook Pro 2019 x 1". */
    order_description?: string;
    /** Url where the customer is redirected after successful payment. */
    success_url?: string;
    /** Url where the customer is redirected after failed payment. */
    cancel_url?: string;
    /** Whether the exchange rate is fixed for the invoice. */
    is_fixed_rate?: boolean;
    /** Whether the exchange fee is paid by the user. */
    is_fee_paid_by_user?: boolean;
  }

  /** IPN (Instant Payment Notification) webhook payload for payments. */
  export interface IpnNotification {
    payment_id: number;
    /** ID of the original payment (for repeated/wrong-asset deposits). */
    parent_payment_id?: number | null;
    invoice_id?: string | null;
    payment_status: PaymentStatus;
    pay_address: string;
    payin_extra_id?: string | null;
    price_amount: Money;
    price_currency: FiatCurrency;
    pay_amount: Money;
    /** Amount actually received from the payer. */
    actually_paid?: Money;
    /** Fiat equivalent of the amount actually paid. */
    actually_paid_at_fiat?: Money;
    pay_currency: CryptoCurrency;
    order_id: string | null;
    order_description: string | null;
    purchase_id: string;
    outcome_amount?: Money;
    outcome_currency?: CryptoCurrency;
    payment_extra_ids?: string | null;
    fee?: Fee;
  }

  /** Balance for a single currency held by the merchant. */
  export interface CurrencyBalance {
    /** Available amount. */
    amount: Money;
    /** Amount pending settlement. */
    pendingAmount: Money;
  }

  /**
   * Account balance response (returned by `GET /v1/balance`).
   * Maps each currency ticker to its balance.
   */
  export type AccountBalance = Record<string, CurrencyBalance>;

  /** Full balance record for a currency (legacy/extended shape). */
  export interface Balance {
    code: CryptoCurrency;
    amount: Money;
    /** Whether withdrawals are currently enabled. */
    withdrawalsEnabled?: boolean;
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
}

export namespace Currencies {
  /** Parameters for listing available currencies. */
  export interface ListParams {
    /**
     * When `true`, only currencies that support fixed-rate exchanges are returned
     * (response includes min/max exchange amounts).
     */
    fixed_rate?: boolean;
  }
  /** Currencies supported by NowPayments (returned as a list of tickers). */
  export type ListResponse = {
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
}
