import type { HttpClient, RequestOptions, QueryParams } from "../http.js";
import type {
  AccountBalance,
  ApiStatus,
  AuthPayload,
  AuthStatus,
  CreateCustomerPayload,
  CreateCustomerResponse,
  CreateInvoicePayload,
  CreatePaymentPayload,
  CreatePayoutPayload,
  CreateRecurringPaymentPayload,
  CreateRecurringPaymentResponse,
  CreateSubscriptionPayload,
  CreatePlanPayload,
  CurrenciesResponse,
  CustomerBalanceResponse,
  CustomersListResponse,
  EstimatedPrice,
  FullCurrenciesResponse,
  Invoice,
  JwtToken,
  ListCurrenciesParams,
  ListCustomersParams,
  ListPlansParams,
  ListSubscriptionsParams,
  ListPayoutsParams,
  MinimumPaymentAmount,
  PaginatedResponse,
  Payment,
  Payout,
  SubscriptionListResponse,
  SubscriptionPlanListResponse,
  SubscriptionPlanResponse,
  SubscriptionResponse,
  UpdatePlanPayload,
  ValidateAddressPayload,
  ValidateAddressResponse,
  VerifyBatchWithdrawalPayload,
  VerifyBatchWithdrawalResponse,
  GetMinWithdrawalAmountResponse,
  GetWithdrawalFeeResponse,
  CryptoCurrency,
} from "../types.js";

/** Base class for resource groups — holds a reference to the HTTP client. */
abstract class Resource {
  protected readonly http: HttpClient;
  constructor(http: HttpClient) {
    this.http = http;
  }
}

/**
 * Authentication & API status endpoints.
 *
 * - `GET /v1/status` — public API health check (no auth required).
 * - `POST /v1/auth` — exchange email/password for a JWT bearer token.
 * - `GET /v1/auth/decoded` — validate the configured API key.
 */
export class AuthResource extends Resource {
  /** Checks API availability. Public endpoint, no API key required. */
  status(options?: RequestOptions): Promise<ApiStatus> {
    return this.http.get<ApiStatus>("/v1/status", undefined, options);
  }

  /** Validates the configured API key. */
  apiKeyStatus(options?: RequestOptions): Promise<AuthStatus> {
    return this.http.get<AuthStatus>("/v1/auth/decoded", undefined, options);
  }

  /** Exchanges email/password for a JWT bearer token. */
  token(payload: AuthPayload, options?: RequestOptions): Promise<JwtToken> {
    return this.http.post<JwtToken>(
      "/v1/auth",
      payload as unknown as Record<string, unknown>,
      options,
    );
  }
}

/**
 * Currency & estimate endpoints.
 *
 * - `GET /v1/currencies` — list available currencies (optionally fixed-rate).
 * - `GET /v1/full-currencies` — detailed currency info (name, logo, network, …).
 * - `GET /v1/merchant/coins` — currencies enabled in the merchant account.
 * - `GET /v1/min-amount` — minimum payment amount for a currency pair.
 * - `GET /v1/estimate` — estimated price for a currency pair.
 */
export class CurrenciesResource extends Resource {
  /**
   * Lists all currencies supported by NowPayments (as tickers).
   * Pass `fixed_rate: true` to filter to fixed-rate currencies.
   */
  list(params?: ListCurrenciesParams, options?: RequestOptions): Promise<CurrenciesResponse> {
    return this.http.get<CurrenciesResponse>(
      "/v1/currencies",
      params as QueryParams | undefined,
      options,
    );
  }

  /**
   * Returns detailed information about every cryptocurrency
   * (name, wallet regex, logo, network, etc.).
   */
  full(options?: RequestOptions): Promise<FullCurrenciesResponse> {
    return this.http.get<FullCurrenciesResponse>("/v1/full-currencies", undefined, options);
  }

  /**
   * Returns the list of cryptocurrencies enabled in the merchant account
   * (Coins Settings).
   */
  checked(options?: RequestOptions): Promise<CurrenciesResponse> {
    return this.http.get<CurrenciesResponse>("/v1/merchant/coins", undefined, options);
  }

  /** Returns the minimum payment amount for a currency pair. */
  minimumAmount(
    params: { currency_from: string; currency_to: string },
    options?: RequestOptions,
  ): Promise<MinimumPaymentAmount> {
    return this.http.get<MinimumPaymentAmount>("/v1/min-amount", params as QueryParams, options);
  }

  /** Returns an estimated price for a given currency pair. */
  estimate(
    params: { amount: number | string; currency_from: string; currency_to: string },
    options?: RequestOptions,
  ): Promise<EstimatedPrice> {
    return this.http.get<EstimatedPrice>("/v1/estimate", params as QueryParams, options);
  }
}

/** Parameters for listing payments. */
export interface ListPaymentsParams {
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

/**
 * Payment endpoints.
 *
 * - `POST /v1/payment` — create a payment.
 * - `GET /v1/payment` — list payments.
 * - `GET /v1/payment/{id}` — get a single payment by id.
 * - `POST /v1/invoice` — create an invoice (payment link).
 * - `GET /v1/invoice/{id}` — get a single invoice.
 * - `GET /v1/balance` — account balances.
 * - `POST /v1/payout/validate-address` — validate a payout address.
 */
export class PaymentsResource extends Resource {
  /** Creates a new payment and returns the deposit address. */
  create(payload: CreatePaymentPayload, options?: RequestOptions): Promise<Payment> {
    return this.http.post<Payment>(
      "/v1/payment",
      payload as unknown as Record<string, unknown>,
      options,
    );
  }

  /** Returns the list of payments for the account. */
  list(params?: ListPaymentsParams, options?: RequestOptions): Promise<PaginatedResponse<Payment>> {
    return this.http.get<PaginatedResponse<Payment>>(
      "/v1/payment",
      params as QueryParams | undefined,
      options,
    );
  }

  /** Returns a single payment by its `payment_id`. */
  get(paymentId: number | string, options?: RequestOptions): Promise<Payment> {
    return this.http.get<Payment>(`/v1/payment/${paymentId}`, undefined, options);
  }

  /** Returns a single invoice by its id. */
  getInvoice(id: number | string, options?: RequestOptions): Promise<Invoice> {
    return this.http.get<Invoice>(`/v1/invoice/${id}`, undefined, options);
  }

  /**
   * Creates a new invoice (payment link) and returns the hosted invoice URL.
   * Authenticated with the API key.
   */
  createInvoice(payload: CreateInvoicePayload, options?: RequestOptions): Promise<Invoice> {
    return this.http.post<Invoice>(
      "/v1/invoice",
      payload as unknown as Record<string, unknown>,
      options,
    );
  }

  /**
   * Returns the current account balances, keyed by currency ticker.
   * Authenticated with the API key.
   */
  balance(options?: RequestOptions): Promise<AccountBalance> {
    return this.http.get<AccountBalance>("/v1/balance", undefined, options);
  }

  /**
   * Validates whether a payout address is valid for the given currency.
   * Authenticated with the API key.
   */
  validateAddress(
    payload: ValidateAddressPayload,
    options?: RequestOptions,
  ): Promise<ValidateAddressResponse> {
    return this.http.post<ValidateAddressResponse>(
      "/v1/payout/validate-address",
      payload as unknown as Record<string, unknown>,
      options,
    );
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
  create(payload: CreatePayoutPayload, options?: RequestOptions): Promise<Payout> {
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

/**
 * Customer management (sub-partner) endpoints.
 *
 * - `GET /v1/sub-partner/balance/:id` — get a customer's balance (API key).
 * - `GET /v1/sub-partner` — list customers (JWT).
 * - `POST /v1/sub-partner` — create a customer account (JWT).
 * - `POST /v1/sub-partner/recurring` — create a recurring payment (JWT).
 */
export class CustomerResource extends Resource {
  /**
   * Returns the balance of a specific customer/sub-partner.
   * Authenticated with the API key.
   */
  balance(customerId: string, options?: RequestOptions): Promise<CustomerBalanceResponse> {
    return this.http.get<CustomerBalanceResponse>(
      `/v1/sub-partner/balance/${customerId}`,
      undefined,
      options,
    );
  }

  /**
   * Returns the list of customers.
   * Authenticated with a JWT bearer token.
   */
  list(params?: ListCustomersParams, options?: RequestOptions): Promise<CustomersListResponse> {
    return this.http.get<CustomersListResponse>(
      "/v1/sub-partner",
      params as QueryParams | undefined,
      options,
    );
  }

  /**
   * Creates a new customer account.
   * Authenticated with a JWT bearer token.
   */
  create(
    payload: CreateCustomerPayload,
    options?: RequestOptions,
  ): Promise<CreateCustomerResponse> {
    return this.http.post<CreateCustomerResponse>(
      "/v1/sub-partner",
      payload as unknown as Record<string, unknown>,
      options,
    );
  }

  /**
   * Creates a recurring payment for a customer.
   * Authenticated with a JWT bearer token.
   */
  createRecurringPayment(
    payload: CreateRecurringPaymentPayload,
    options?: RequestOptions,
  ): Promise<CreateRecurringPaymentResponse> {
    return this.http.post<CreateRecurringPaymentResponse>(
      "/v1/sub-partner/recurring",
      payload as unknown as Record<string, unknown>,
      options,
    );
  }
}

/**
 * Email subscriptions (recurring payments) endpoints.
 *
 * - `POST v1/subscriptions` — create a subscription (JWT).
 * - `GET v1/subscriptions` — list subscriptions (JWT).
 * - `PUT v1/subscriptions/:id` — update a subscription (JWT).
 * - `POST v1/subscriptions/:id/cancel` — cancel a subscription (JWT).
 *
 * Subscription plans (recurring payment plans) endpoints.
 *
 * - `POST v1/subscriptions/plans` — create a plan (JWT).
 * - `GET v1/subscriptions/plans/:id` — get a plan (API key).
 * - `GET v1/subscriptions/plans` — list plans (API key).
 * - `PATCH v1/subscriptions/plans/:id` — update a plan (JWT).
 *
 * Subscription payments (recurring payments) endpoints.
 *
 * - `POST v1/subscriptions` — create a subscription payment (API key & JWT).
 * - `GET v1/subscriptions` — list subscription payments (API key).
 * - `GET v1/subscriptions/:id` — get a subscription payment (API key).
 * - `DELETE v1/subscriptions/:id` — cancel a subscription payment (JWT).
 */
export class SubscriptionResource extends Resource {
  /**
   * Creates a new subscription plan.
   * Authenticated with a JWT bearer token.
   */
  createPlan(
    payload: CreatePlanPayload,
    options?: RequestOptions,
  ): Promise<SubscriptionPlanResponse> {
    return this.http.post<SubscriptionPlanResponse>(
      "v1/subscriptions/plans",
      payload as unknown as Record<string, unknown>,
      options,
    );
  }

  /**
   * Gets a single subscription plan by its id.
   * Requires API key authentication.
   */
  getPlan(id: string, options?: RequestOptions): Promise<SubscriptionPlanResponse> {
    return this.http.get<SubscriptionPlanResponse>(
      `v1/subscriptions/plans/${id}`,
      undefined,
      options,
    );
  }

  /**
   * Lists all subscription plans.
   * Requires API key authentication.
   */
  getAllPlans(
    params?: ListPlansParams,
    options?: RequestOptions,
  ): Promise<SubscriptionPlanListResponse> {
    return this.http.get<SubscriptionPlanListResponse>(
      "v1/subscriptions/plans",
      params as QueryParams | undefined,
      options,
    );
  }

  /**
   * Updates an existing subscription plan.
   * Authenticated with a JWT bearer token.
   */
  updatePlan(
    id: string,
    payload: UpdatePlanPayload,
    options?: RequestOptions,
  ): Promise<SubscriptionPlanResponse> {
    return this.http.patch<SubscriptionPlanResponse>(
      `v1/subscriptions/plans/${id}`,
      payload as unknown as Record<string, unknown>,
      options,
    );
  }

  /**
   * Creates a new subscription payment.
   * Authenticated with API key or JWT.
   */
  createPayment(
    payload: CreateSubscriptionPayload,
    options?: RequestOptions,
  ): Promise<SubscriptionResponse> {
    return this.http.post<SubscriptionResponse>(
      "v1/subscriptions",
      payload as unknown as Record<string, unknown>,
      options,
    );
  }

  /**
   * Lists subscription payments with optional filters.
   * Requires API key authentication.
   */
  listPayments(
    params?: ListSubscriptionsParams,
    options?: RequestOptions,
  ): Promise<SubscriptionListResponse> {
    return this.http.get<SubscriptionListResponse>(
      "v1/subscriptions",
      params as QueryParams | undefined,
      options,
    );
  }

  /**
   * Gets a single subscription payment by its id.
   * Requires API key authentication.
   */
  getPayment(id: string, options?: RequestOptions): Promise<SubscriptionResponse> {
    return this.http.get<SubscriptionResponse>(
      `v1/subscriptions/${id}`,
      undefined,
      options,
    );
  }

  /**
   * Cancels a subscription payment by its id.
   * Authenticated with a JWT bearer token.
   */
  cancelPayment(id: string, options?: RequestOptions): Promise<SubscriptionResponse> {
    return this.http.delete<SubscriptionResponse>(
      `v1/subscriptions/${id}`,
      undefined,
      options,
    );
  }
}
