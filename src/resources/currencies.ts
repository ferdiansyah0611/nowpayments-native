import type { HttpClient, RequestOptions, QueryParams } from "../http.js";
import type {
  CurrenciesResponse,
  FullCurrenciesResponse,
  EstimatedPrice,
  MinimumPaymentAmount,
  ListCurrenciesParams,
} from "../types.js";

/** Base class for resource groups — holds a reference to the HTTP client. */
abstract class Resource {
  protected readonly http: HttpClient;
  constructor(http: HttpClient) {
    this.http = http;
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