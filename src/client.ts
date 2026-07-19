import { HttpClient, type HttpClientConfig } from "./http.js";
import {
  AuthResource,
  CurrenciesResource,
  CustomerResource,
  PaymentsResource,
  PayoutsResource,
  SubscriptionResource,
  ConversionResource,
} from "./resources/index.js";

/** Options accepted by the {@link NowPayments} client constructor. */
export interface NowPaymentsOptions {
  /** API key issued by NowPayments (required for most endpoints). */
  apiKey?: string;
  /** JWT bearer token (alternative to API key, obtained via `/auth`). */
  jwt?: string;
  /**
   * Base URL of the API.
   * @default "https://api.nowpayments.io"
   */
  baseUrl?: string;
  /** Default request timeout in milliseconds. @default 30_000 */
  timeoutMs?: number;
  /** Custom `fetch` implementation (tests, edge runtimes). */
  fetchImpl?: typeof fetch;
}

/**
 * Type-safe client for the NowPayments.io API.
 *
 * @example
 * ```ts
 * const client = new NowPayments({ apiKey: process.env.NOWPAYMENTS_API_KEY });
 * const payment = await client.payments.create({
 *   price_amount: 10,
 *   price_currency: "usd",
 *   pay_currency: "btc",
 * });
 * ```
 */
export class NowPayments {
  private readonly http: HttpClient;
  public readonly auth: AuthResource;
  public readonly currencies: CurrenciesResource;
  public readonly payments: PaymentsResource;
  public readonly payouts: PayoutsResource;
  public readonly customers: CustomerResource;
  public readonly subscriptions: SubscriptionResource;
  public readonly conversions: ConversionResource;

  constructor(options: NowPaymentsOptions = {}) {
    const config: HttpClientConfig = {
      baseUrl: options.baseUrl ?? "https://api.nowpayments.io",
      apiKey: options.apiKey,
      jwt: options.jwt,
      timeoutMs: options.timeoutMs ?? 30_000,
      fetchImpl: options.fetchImpl,
    };

    if (!config.apiKey && !config.jwt) {
      // We don't throw — some endpoints (e.g. `/auth`) work without a key,
      // but we warn so misconfiguration is caught early.
      console.warn("[nowpayments] No API key or JWT provided — most endpoints will fail.");
    }

    this.http = new HttpClient(config);
    this.auth = new AuthResource(this.http);
    this.currencies = new CurrenciesResource(this.http);
    this.payments = new PaymentsResource(this.http);
    this.payouts = new PayoutsResource(this.http);
    this.customers = new CustomerResource(this.http);
    this.subscriptions = new SubscriptionResource(this.http);
    this.conversions = new ConversionResource(this.http);
  }

  /** Returns a new client authenticated with the given JWT. */
  withJwt(jwt: string): NowPayments {
    return new NowPayments({ ...this.http.getConfig(), apiKey: undefined, jwt });
  }

  /** Returns a new client authenticated with the given API key. */
  withApiKey(apiKey: string): NowPayments {
    return new NowPayments({ ...this.http.getConfig(), apiKey });
  }
}

export default NowPayments;
