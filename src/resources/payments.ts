import type { HttpClient, RequestOptions, QueryParams } from "../http.js";
import type {
  AccountBalance,
  CreateInvoicePayload,
  CreatePaymentPayload,
  Invoice,
  PaginatedResponse,
  Payment,
  ValidateAddressPayload,
  ValidateAddressResponse,
} from "../types/index.js";

/** Base class for resource groups — holds a reference to the HTTP client. */
abstract class Resource {
  protected readonly http: HttpClient;
  constructor(http: HttpClient) {
    this.http = http;
  }
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
  list(params?: { limit?: number; page?: number; sortBy?: string; orderBy?: "asc" | "desc"; dateFrom?: string; dateTo?: string }, options?: RequestOptions): Promise<PaginatedResponse<Payment>> {
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