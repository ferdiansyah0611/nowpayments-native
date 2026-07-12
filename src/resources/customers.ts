import type { HttpClient, RequestOptions, QueryParams } from "../http.js";
import type {
  ListTransfersParams
} from "../types/index.js";
import type { Customer } from "../types/customers.types.js";

/** Base class for resource groups — holds a reference to the HTTP client. */
abstract class Resource {
  protected readonly http: HttpClient;
  constructor(http: HttpClient) {
    this.http = http;
  }
}

export interface ListPaymentsCustomerParams {
  /** amount of listed results */
  limit: number;
  /** set the offset for listed results */
  page?: number;
  /** filter by payment ID */
  id?: string;
  /** filter by deposit currency */
  pay_currency?: string;
  /** filter by status */
  status?: string;
  /** filter by sub-partner ID */
  sub_partner_id?: string;
  /** filter by date (from) */
  date_from?: string;
  /** filter by date (to) */
  date_to?: string;
  /** set the order for listed results (asc, desc) */
  orderBy?: "asc" | "desc";
  /** sort results by 'id', 'status', 'pay_currency', 'created_at', 'updated_at' */
  sortBy?: "id" | "status" | "pay_currency" | "created_at" | "updated_at";
}

/**
 * Customer management (sub-partner) endpoints.
 *
 * - `GET /v1/sub-partner/balance/:id` — get a customer's balance (API key).
 * - `GET /v1/sub-partner` — list customers (JWT).
 * - `POST /v1/sub-partner` — create a customer account (JWT).
 * - `POST /v1/sub-partner/recurring` — create a recurring payment (JWT).
 * - `POST /v1/sub-partner/payment` — create a payment for a customer (JWT).
 * - `GET /v1/sub-partner/payments` — list payments for a customer (JWT).
 * - `POST /v1/sub-partner/deposit` — deposit funds to a customer (JWT).
 * - `POST /v1/sub-partner/transfer` — transfer funds between customers (JWT).
 * - `GET /v1/sub-partner/transfer` — list transfers (JWT).
 * - `GET /v1/sub-partner/transfer/:id` — get a single transfer (JWT).
 * - `POST /v1/sub-partner/write-off` — write off funds from a customer (JWT).
 */
export class CustomerResource extends Resource {
  /**
   * Returns the balance of a specific customer/sub-partner.
   * Authenticated with the API key.
   */
  balance(customerId: string, options?: RequestOptions): Promise<Customer.BalanceResponse> {
    return this.http.get<Customer.BalanceResponse>(
      `/v1/sub-partner/balance/${customerId}`,
      undefined,
      options,
    );
  }

  /**
   * Returns the list of customers.
   * Authenticated with a JWT bearer token.
   */
  list(params?: { limit?: number; offset?: number; order?: string }, options?: RequestOptions): Promise<Customer.ListResponse> {
    return this.http.get<Customer.ListResponse>(
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
    payload: Customer.CreatePayload,
    options?: RequestOptions,
  ): Promise<Customer.CreateResponse> {
    return this.http.post<Customer.CreateResponse>(
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
    payload: { customer_id: string; amount: string; currency: string },
    options?: RequestOptions,
  ): Promise<{ result: { id: string; status: string; amount: string; currency: string } }> {
    return this.http.post<{ result: { id: string; status: string; amount: string; currency: string } }>(
      "/v1/sub-partner/recurring",
      payload as unknown as Record<string, unknown>,
      options,
    );
  }

  /**
   * Creates a payment for a customer.
   * Authenticated with a JWT bearer token.
   */
  createPayment(
    payload: Customer.CreatePaymentPayload,
    options?: RequestOptions,
  ): Promise<Customer.Payment> {
    return this.http.post<Customer.Payment>(
      "/v1/sub-partner/payment",
      payload as unknown as Record<string, unknown>,
      options,
    );
  }

  /**
   * Returns the list of payments for a customer.
   * Authenticated with a JWT bearer token.
   */
  listPayments(
    params?: ListPaymentsCustomerParams,
    options?: RequestOptions,
  ): Promise<Customer.PaymentsListResponse> {
    return this.http.get<Customer.PaymentsListResponse>(
      "/v1/sub-partner/payments",
      params as QueryParams | undefined,
      options,
    );
  }

  /**
   * This is a method for transferring funds from your master account to a customer's one.
   * The actual information about the transfer's status can be obtained via Get transfer method.
   */
  createDeposits(
    payload: Customer.DepositPayload,
    options?: RequestOptions,
  ): Promise<{ result: Customer.CreateDepositResponse }> {
    return this.http.post<{ result: Customer.CreateDepositResponse }>(
      "/v1/sub-partner/deposit",
      payload as unknown as Record<string, unknown>,
      options,
    );
  }

  /**
   * Returns the list of deposits for a customer.
   * Authenticated with a JWT bearer token.
   */
  listDeposits(
    params?: { limit?: number; page?: number; id?: string; pay_currency?: string; status?: string; sub_partner_id?: string; date_from?: string; date_to?: string; orderBy?: "asc" | "desc"; sortBy?: "id" | "status" | "pay_currency" | "created_at" | "updated_at" },
    options?: RequestOptions,
  ): Promise<Customer.DepositListResponse> {
    return this.http.get<Customer.DepositListResponse>(
      "/v1/sub-partner/deposit",
      params as QueryParams | undefined,
      options,
    );
  }

  /**
   * Returns a single deposit by its id.
   * Authenticated with a JWT bearer token.
   */
  getDeposit(depositId: number | string, options?: RequestOptions): Promise<Customer.Deposit> {
    return this.http.get<Customer.Deposit>(`/v1/sub-partner/deposit/${depositId}`, undefined, options);
  }

  /**
   * Creates a transfer between two customers.
   * Authenticated with a JWT bearer token.
   */
  createTransfers(
    params: Customer.TransferPayload,
    options?: RequestOptions,
  ): Promise<Customer.WriteOffCreateResponse> {
    return this.http.post<Customer.WriteOffCreateResponse>(
      "/v1/sub-partner/transfer",
      params as unknown as Record<string, unknown>,
      options,
    );
  }
  
  /**
   * Returns the list of transfers for a customer.
   * Authenticated with a JWT bearer token.
   */
  listTransfers(
    params?: ListTransfersParams,
    options?: RequestOptions,
  ): Promise<Customer.TransferListResponse> {
    return this.http.get<Customer.TransferListResponse>(
      "/v1/sub-partner/transfer",
      params as QueryParams | undefined,
      options,
    );
  }

  /**
   * Returns a single transfer by its id.
   * Authenticated with a JWT bearer token.
   */
  getTransfer(transferId: number | string, options?: RequestOptions): Promise<Customer.Transfer> {
    return this.http.get<Customer.Transfer>(`/v1/sub-partner/transfer/${transferId}`, undefined, options);
  }

  /**
   * With this method you can withdraw funds from a customer's account and transfer them to your master account.
   */
  createWriteOff(
    payload: Customer.WriteOffPayload,
    options?: RequestOptions,    
  ): Promise<Customer.WriteOffCreateResponse> {
    return this.http.post<Customer.WriteOffCreateResponse>(
      "/v1/sub-partner/write-off",
      payload  as unknown as Record<string, unknown>,
      options,
    );
  }
}