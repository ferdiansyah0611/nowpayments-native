/**
 * Shared domain types for the NowPayments API.
 *
 * Only the subset of fields that are documented and stable are typed as
 * required; everything else is left as optional to remain forward-compatible
 * with future API additions.
 */

/** ISO 4217 fiat currency code (e.g. `usd`, `eur`). Treated as a string. */
export type FiatCurrency = string;

/** Crypto asset ticker (e.g. `btc`, `eth`, `usdt`). Treated as a string. */
export type CryptoCurrency = string;

/** A monetary amount. NowPayments accepts strings or numbers; we normalize to string. */
export type Money = string | number;

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
  fee?: PaymentFee;
  network?: string;
  result_url?: string;
  unfix_address_url?: string;
  ipn_callback_url?: string;
  partially_paid_url?: string;
  underpaid_url?: string;
  overpaid_url?: string;
}

/** Fee breakdown returned in payment records and IPN webhooks. */
export interface PaymentFee {
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
export interface CreatePaymentPayload {
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
export interface CreatePayoutPayload {
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
export interface ListPayoutsParams {
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
export interface GetWithdrawalFeeResponse {
  /** Currency. */
  currency: CryptoCurrency;
  /** Withdrawal fee. */
  fee: number;
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
  fee?: PaymentFee;
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

/** API status response (returned by `GET /v1/status`). */
export interface ApiStatus {
  /** Status message, e.g. "OK". */
  message: string;
}

/** Authentication status response (returned by `GET /v1/auth/decoded`). */
export interface AuthStatus {
  /** Whether the API key is valid. */
  result: boolean;
  /** Message describing the result. */
  message?: string;
  code?: number;
}

/** JWT token response from `/auth`. */
export interface JwtToken {
  token: string;
}

/** API key payload for `/auth`. */
export interface AuthPayload {
  email: string;
  password: string;
}

/** Payment verification result. */
export interface PaymentVerification {
  /** Whether the payment verification succeeded. */
  result: boolean;
  message?: string;
  code?: number;
}

// ---------------------------------------------------------------------------
// Customer Management (sub-partner) types
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Customer Payment & Transfer types
// ---------------------------------------------------------------------------

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

/** Payload to transfer between customers. */
export interface TransferPayload {
  currency: string,
  amount: number,
  from_id: string,
  to_id:  string
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

/** Transfer list response. */
export interface TransferListResponse {
  result: Transfer[];
  /** Total number of transfers. */
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

// ---------------------------------------------------------------------------
// Email Subscriptions (recurring payments) types
// ---------------------------------------------------------------------------

/** Billing interval for an email subscription. */
export type SubscriptionInterval = "daily" | "weekly" | "monthly" | "yearly";

/** Lifecycle status of an email subscription. */
export type SubscriptionStatus = "CREATED" | "ACTIVE" | "UPDATED" | "CANCELLED" | "FAILED";

/** A single email subscription record. */
export interface EmailSubscription {
  /** Subscription id. */
  id: string;
  /** ID of the payment plan. */
  subscription_plan_id: string | number;
  /** Whether the subscription is currently active. */
  is_active: boolean;
  subscriber: {
    /** Customer email charged by the subscription. */
    email: string;
  };
  /** Expiration date of the subscription. */
  expire_date: string;
  /** Subscription status. */
  status: SubscriptionPaymentStatus;
  /** ISO 8601 creation timestamp. */
  created_at?: string;
  /** ISO 8601 last-update timestamp. */
  updated_at?: string;
}

/** Response wrapper for subscription endpoints (`{ result: {...} }`). */
export interface SubscriptionResponse {
  result: EmailSubscription;
}

/** Response wrapper for the list endpoint (`{ result: [...] }`). */
export interface SubscriptionListResponse {
  result: EmailSubscription[];
  /** Total number of subscriptions matching the query. */
  count?: number;
}

/** Payload to update an email subscription (`PUT /v1/sub-partner/email-subscription/:id`). */
export interface UpdateSubscriptionPayload {
  /** New amount charged every interval. */
  amount?: Money;
  /** New currency ticker. */
  currency?: CryptoCurrency;
  /** New billing interval. */
  interval?: SubscriptionInterval;
}

// Subscription Plans (recurring payment plans) types
// ---------------------------------------------------------------------------

/** A single subscription plan record. */
export interface SubscriptionPlan {
  /** Plan id. */
  id: string;
  /** Name of the recurring payments plan. */
  title: string;
  /** Recurring payments duration in days. */
  interval_day: string;
  /** IPN callback URL. */
  ipn_callback_url?: string | null;
  /** URL user gets redirected to in case payment is successful. */
  success_url?: string | null;
  /** URL user gets redirected to in case payment is cancelled. */
  cancel_url?: string | null;
  /** URL user gets redirected to in case payment is underpaid. */
  partially_paid_url?: string | null;
  /** Amount of funds paid in fiat. */
  amount: number;
  /** Fiat currency ticker used for price. */
  currency: FiatCurrency;
  /** ISO 8601 creation timestamp. */
  created_at: string;
  /** ISO 8601 last-update timestamp. */
  updated_at: string;
}

/** Payload to create a new subscription plan (`POST v1/subscriptions/plans`). */
export interface CreatePlanPayload {
  /** Name of the recurring payments plan. */
  title: string;
  /** Recurring payments duration in days. */
  interval_day: number;
  /** Amount of funds paid in fiat. */
  amount: number;
  /** Fiat currency ticker used for price. */
  currency: FiatCurrency;
  /** IPN callback URL. */
  ipn_callback_url?: string;
  /** URL user gets redirected to in case payment is successful. */
  success_url?: string;
  /** URL user gets redirected to in case payment is cancelled. */
  cancel_url?: string;
  /** URL user gets redirected to in case payment is underpaid. */
  partially_paid_url?: string;
}

/** Payload to update a subscription plan (`PATCH v1/subscriptions/plans/:plan-id`). */
export interface UpdatePlanPayload {
  /** Name of the recurring payments plan. */
  title?: string;
  /** Recurring payments duration in days. */
  interval_day?: number;
  /** Amount of funds paid in fiat. */
  amount?: number;
  /** Fiat currency ticker used for price. */
  currency?: FiatCurrency;
  /** IPN callback URL. */
  ipn_callback_url?: string;
  /** URL user gets redirected to in case payment is successful. */
  success_url?: string;
  /** URL user gets redirected to in case payment is cancelled. */
  cancel_url?: string;
  /** URL user gets redirected to in case payment is underpaid. */
  partially_paid_url?: string;
}

/** Response wrapper for subscription plan endpoints (`{ result: {...} }`). */
export interface SubscriptionPlanResponse {
  result: SubscriptionPlan;
}

/** Response wrapper for the list plans endpoint (`{ result: [...] }`). */
export interface SubscriptionPlanListResponse {
  result: SubscriptionPlan[];
  /** Total number of plans matching the query. */
  count?: number;
}

/** Parameters for listing subscription plans. */
export interface ListPlansParams {
  /** Maximum number of records to return. */
  limit?: number;
  /** Page number (0-indexed). */
  offset?: number;
}

/** Status of a subscription payment. */
export type SubscriptionPaymentStatus =
  | "WAITING_PAY"
  | "PAID"
  | "PARTIALLY_PAID"
  | "EXPIRED";

/** Subscriber information for a subscription. */
export interface SubscriptionSubscriber {
  /** Email of the subscriber. */
  email?: string;
  /** Sub-partner ID of the subscriber. */
  sub_partner_id?: string;
}

/** A single subscription record (recurring payment). */
export interface Subscription {
  /** Subscription id. */
  id: string;
  /** ID of the payment plan. */
  subscription_plan_id: string | number;
  /** Whether the subscription is active. */
  is_active: boolean;
  /** Current payment status. */
  status: SubscriptionPaymentStatus;
  /** Expiration date of the subscription. */
  expire_date: string;
  /** Subscriber information. */
  subscriber: SubscriptionSubscriber;
  /** ISO 8601 creation timestamp. */
  created_at: string;
  /** ISO 8601 last-update timestamp. */
  updated_at: string;
}

/** Payload to create a new subscription (`POST v1/subscriptions`). */
export interface CreateSubscriptionPayload {
  /** ID of the payment plan. */
  subscription_plan_id: string | number;
  /** Customer email to send payment links to. */
  email: string;
}

/** Parameters for listing subscriptions. */
export interface ListSubscriptionsParams {
  /** Maximum number of records to return. */
  limit?: number;
  /** Page number (0-indexed). */
  offset?: number;
  /** Filter by subscription status. */
  status?: SubscriptionPaymentStatus;
  /** Filter by subscription plan ID. */
  subscription_plan_id?: string | number;
  /** Filter by active status. */
  is_active?: boolean;
}

export type ListTransfersStatus = "WAITING"|"CREATED"|"FINISHED"|"REJECTED";
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

// ---------------------------------------------------------------------------
// Conversion (currency conversion) types
// ---------------------------------------------------------------------------

/** Status of a currency conversion. */
export type ConversionStatus =
  | "WAITING"
  | "PROCESSING"
  | "FINISHED"
  | "REJECTED";

/** A single conversion record. */
export interface Conversion {
  /** Conversion ID. */
  id: string;
  /** Current status of the conversion. */
  status: ConversionStatus;
  /** Currency being converted from. */
  from_currency: CryptoCurrency;
  /** Currency being converted to. */
  to_currency: CryptoCurrency;
  /** Amount being converted from. */
  from_amount: Money;
  /** Amount received after conversion. */
  to_amount: Money | null;
  /** ISO 8601 creation timestamp. */
  created_at: string;
  /** ISO 8601 last-update timestamp. */
  updated_at: string;
}

/** Payload to create a new conversion. */
export interface CreateConversionPayload {
  /** The amount of the conversion. */
  amount: Money;
  /** The currency you're converting your funds from. */
  from_currency: CryptoCurrency;
  /** The currency you're converting your funds to. */
  to_currency: CryptoCurrency;
}

/** Response wrapper for conversion operations. */
export interface ConversionResponse {
  result: Conversion;
}

/** Parameters for listing conversions. */
export interface ListConversionsParams {
  /** Filter by ID of the conversion (int or array of int). */
  id?: number | number[];
  /** Filter conversions by certain status (string or array of string). */
  status?: ConversionStatus | ConversionStatus[];
  /** Filter by initial currency of the conversion. */
  from_currency?: CryptoCurrency;
  /** Filter by outcome currency of the conversion. */
  to_currency?: CryptoCurrency;
  /** Filter by date (ISO 8601 format). */
  created_at_from?: string;
  /** Filter by date (ISO 8601 format). */
  created_at_to?: string;
  /** Set the limit of shown results. @default 10 */
  limit?: number;
  /** Page number (0-indexed). @default 0 */
  offset?: number;
  /** Set the sorting order of provided data. */
  order?: "ASC" | "DESC";
}

/** Response for listing conversions. */
export interface ListConversionsResponse {
  result: Conversion[];
  /** Total number of conversions matching the query. */
  count: number;
}
