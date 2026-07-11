/**
 * Customer management (sub-partner) types for the NowPayments API.
 */

import type { CryptoCurrency, FiatCurrency, Money, PaymentStatus, ListTransfersStatus } from "./main.js";

/** Balance for a single currency held by a customer/sub-partner. */
export interface CustomerCurrencyBalance {
  /** Available amount. */
  amount: Money;
  /** Amount pending settlement. */
  pendingAmount: Money;
}

/** Customer balance response (returned by `GET /v1/sub-partner/balance/:id`). */
export interface CustomerBalance {
  /** The sub-partner/customer id. */
  subPartnerId: string;
  /** Map of currency ticker → balance. */
  balances: Record<string, CustomerCurrencyBalance>;
}

/** Wrapper for the customer balance response (`{ result: {...} }`). */
export interface CustomerBalanceResponse {
  result: CustomerBalance;
}

/** A single customer/sub-partner record. */
export interface Customer {
  /** Customer id. */
  id: string;
  /** Customer display name. */
  name: string;
  /** ISO 8601 creation timestamp. */
  created_at: string;
  /** ISO 8601 last-update timestamp. */
  updated_at: string;
}

/** Customers list response (returned by `GET /v1/sub-partner`). */
export interface CustomersListResponse {
  result: Customer[];
  /** Total number of customers matching the query. */
  count: number;
}

/** Payload to create a new customer account. */
export interface CreateCustomerPayload {
  /** Customer display name. */
  name: string;
}

/** Created customer response (returned by `POST /v1/sub-partner`). */
export interface CreateCustomerResponse {
  result: Pick<Customer, "id" | "name" | "created_at">;
}

/** Payload to create a recurring payment for a customer. */
export interface CreateRecurringPaymentPayload {
  /** Id of the customer the recurring payment is created for. */
  customer_id: string;
  /** Recurring payment amount. */
  amount: Money;
  /** Currency ticker (e.g. `usdttrc20`). */
  currency: CryptoCurrency;
}

/** Recurring payment status. */
export type RecurringPaymentStatus = "CREATED" | "PROCESSING" | "DONE" | "FAILED";

/** Created recurring payment response. */
export interface CreateRecurringPaymentResponse {
  result: {
    id: string;
    status: RecurringPaymentStatus;
    amount: Money;
    currency: CryptoCurrency;
  };
}

/** Parameters for listing customers. */
export interface ListCustomersParams {
  /** Filter by customer id. */
  id?: string;
  /** Number of records to skip. */
  offset?: number;
  /** Maximum number of records to return. */
  limit?: number;
  /** Sort direction. */
  order?: "ASC" | "DESC";
}

/** Payload to create a payment for a customer. */
export interface CreateCustomerPaymentPayload {
  /** Customer id. */
  sub_partner_id: string;
  /** Amount to pay in fiat currency. */
  price_amount: Money;
  /** Fiat currency in which the price_amount is specified (usd, eur, etc). */
  price_currency: FiatCurrency;
  /** Crypto currency in which the pay_amount is specified. */
  pay_currency?: CryptoCurrency;
  /** Url to receive callbacks. */
  ipn_callback_url?: string;
  /** Inner store order ID. */
  order_id?: string;
  /** Inner store order description. */
  order_description?: string;
}

/** Customer payment record. */
export interface CustomerPayment {
  /** Payment id. */
  payment_id: number;
  /** Payment status. */
  payment_status: PaymentStatus;
  /** Deposit address. */
  pay_address: string;
  /** Amount to pay in crypto. */
  pay_amount: Money;
  /** Amount actually paid. */
  actually_paid?: Money;
  /** Fiat equivalent of actually paid amount. */
  actually_paid_at_fiat?: Money;
  /** Crypto currency. */
  pay_currency: CryptoCurrency;
  /** Fiat amount. */
  price_amount: Money;
  /** Fiat currency. */
  price_currency: FiatCurrency;
  /** Order ID. */
  order_id: string | null;
  /** Order description. */
  order_description: string | null;
  /** Purchase ID. */
  purchase_id: string | null;
  /** Outcome amount. */
  outcome_amount?: Money;
  /** Outcome currency. */
  outcome_currency?: CryptoCurrency;
  /** Parent payment ID (for repeated deposits). */
  parent_payment_id?: number | null;
  /** Invoice ID. */
  invoice_id?: string | null;
  /** Payment extra IDs. */
  payment_extra_ids?: string | null;
  /** Created at timestamp. */
  created_at: string;
  /** Updated at timestamp. */
  updated_at: string;
}

/** Customer payments list response. */
export interface CustomerPaymentsListResponse {
  result: CustomerPayment[];
  /** Total number of payments. */
  count: number;
}

/** Payload to deposit from master account to customer. */
export interface DepositPayload {
  currency: string;
  amount: number;
  sub_partner_id: string;
}

export interface CreateDepositResponse {
  id: string;
  /** main account */
  from_sub_id: string;
  /** sub account */
  to_sub_id: string;
  status: ListTransfersStatus,
  created_at: string;
  updated_at: string;
  amount: string;
  currency: string;
}

/** Deposit record. */
export interface Deposit {
  /** Deposit id. */
  id: number;
  /** Customer id. */
  sub_partner_id: string;
  /** Payment status. */
  payment_status: PaymentStatus;
  /** Deposit address. */
  pay_address: string;
  /** Amount to deposit. */
  pay_amount: Money;
  /** Amount actually deposited. */
  actually_paid?: Money;
  /** Fiat equivalent of actually deposited amount. */
  actually_paid_at_fiat?: Money;
  /** Crypto currency. */
  pay_currency: CryptoCurrency;
  /** Fiat amount. */
  price_amount: Money;
  /** Fiat currency. */
  price_currency: FiatCurrency;
  /** Order ID. */
  order_id: string | null;
  /** Order description. */
  order_description: string | null;
  /** Purchase ID. */
  purchase_id: string | null;
  /** Outcome amount. */
  outcome_amount?: Money;
  /** Outcome currency. */
  outcome_currency?: CryptoCurrency;
  /** Parent payment ID. */
  parent_payment_id?: number | null;
  /** Invoice ID. */
  invoice_id?: string | null;
  /** Payment extra IDs. */
  payment_extra_ids?: string | null;
  /** Created at timestamp. */
  created_at: string;
  /** Updated at timestamp. */
  updated_at: string;
}

/** Deposit list response. */
export interface DepositListResponse {
  result: Deposit[];
  /** Total number of deposits. */
  count: number;
}

/** Payload to transfer between customers. */
export interface TransferPayload {
  /** From customer id. */
  from_id: string;
  /** To customer id. */
  to_id: string;
  /** Amount to transfer. */
  amount: number;
  /** Currency of the amount to transfer. */
  currency: string;
}

/** Transfer record. */
export interface Transfer {
  /** Transfer id. */
  id: number;
  /** From customer id. */
  from_sub_partner_id: string;
  /** To customer id. */
  to_sub_partner_id: string;
  /** Payment status. */
  payment_status: PaymentStatus;
  /** Deposit address. */
  pay_address: string;
  /** Amount to transfer. */
  pay_amount: Money;
  /** Amount actually transferred. */
  actually_paid?: Money;
  /** Fiat equivalent of actually transferred amount. */
  actually_paid_at_fiat?: Money;
  /** Crypto currency. */
  pay_currency: CryptoCurrency;
  /** Fiat amount. */
  price_amount: Money;
  /** Fiat currency. */
  price_currency: FiatCurrency;
  /** Order ID. */
  order_id: string | null;
  /** Order description. */
  order_description: string | null;
  /** Purchase ID. */
  purchase_id: string | null;
  /** Outcome amount. */
  outcome_amount?: Money;
  /** Outcome currency. */
  outcome_currency?: CryptoCurrency;
  /** Parent payment ID. */
  parent_payment_id?: number | null;
  /** Invoice ID. */
  invoice_id?: string | null;
  /** Payment extra IDs. */
  payment_extra_ids?: string | null;
  /** Created at timestamp. */
  created_at: string;
  /** Updated at timestamp. */
  updated_at: string;
}

/** Transfer list response. */
export interface TransferListResponse {
  result: Transfer[];
  /** Total number of transfers. */
  count: number;
}

/** Write off record. */
export interface WriteOff {
  /** Write off id. */
  id: number;
  /** Customer id. */
  sub_partner_id: string;
  /** Payment status. */
  payment_status: PaymentStatus;
  /** Deposit address. */
  pay_address: string;
  /** Amount to write off. */
  pay_amount: Money;
  /** Amount actually written off. */
  actually_paid?: Money;
  /** Fiat equivalent of actually written off amount. */
  actually_paid_at_fiat?: Money;
  /** Crypto currency. */
  pay_currency: CryptoCurrency;
  /** Fiat amount. */
  price_amount: Money;
  /** Fiat currency. */
  price_currency: FiatCurrency;
  /** Order ID. */
  order_id: string | null;
  /** Order description. */
  order_description: string | null;
  /** Purchase ID. */
  purchase_id: string | null;
  /** Outcome amount. */
  outcome_amount?: Money;
  /** Outcome currency. */
  outcome_currency?: CryptoCurrency;
  /** Parent payment ID. */
  parent_payment_id?: number | null;
  /** Invoice ID. */
  invoice_id?: string | null;
  /** Payment extra IDs. */
  payment_extra_ids?: string | null;
  /** Created at timestamp. */
  created_at: string;
  /** Updated at timestamp. */
  updated_at: string;
}

/** Write off list response. */
export interface WriteOffListResponse {
  result: WriteOff[];
  /** Total number of write offs. */
  count: number;
}

/** Payload to write off on customer account. */
export interface WriteOffPayload {
  currency: string;
  amount: number;
  sub_partner_id: string;
}

export interface WriteOffCreateResponse {
  result: {
    id: string;
    from_sub_id: string;
    to_sub_id: string;
    status: ListTransfersStatus;
    created_at: string;
    updated_at: string;
    amount: string;
    currency: string;
  }
}