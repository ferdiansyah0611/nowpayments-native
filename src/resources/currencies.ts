import type { RequestOptions, QueryParams } from "../http.js";
import type { Currencies } from "../types/payments.types.js";
import { Resource } from "./main.js";

/**
 * Currency & estimate endpoints.
 *
 * - `GET /v1/currencies` — list available currencies (optionally fixed-rate).
 * - `GET /v1/full-currencies` — detailed currency info (name, logo, network, …).
 * - `GET /v1/merchant/coins` — currencies enabled in the merchant account.
 */
export class CurrenciesResource extends Resource {
  /**
   * This is a method for obtaining information about all cryptocurrencies available for payments for your current setup.
   * @requires APIKey
   */
  list(params?: Currencies.ListParams, options?: RequestOptions): Promise<Currencies.ListResponse> {
    return this.http.get<Currencies.ListResponse>(
      "/v1/currencies",
      params as QueryParams | undefined,
      options,
    );
  }

  /**
   * This is a method to obtain detailed information about all cryptocurrencies available for payments.
   * @requires APIKey
   */
  full(options?: RequestOptions): Promise<Currencies.FullCurrenciesResponse> {
    return this.http.get<Currencies.FullCurrenciesResponse>("/v1/full-currencies", undefined, options);
  }

  /**
   * This is a method for obtaining information about the cryptocurrencies available for payments.
   * Shows the coins you set as available for payments in the "coins settings" tab on your personal account.
   * @requires APIKey
   */
  checked(options?: RequestOptions): Promise<Currencies.CheckedResponse> {
    return this.http.get<Currencies.CheckedResponse>("/v1/merchant/coins", undefined, options);
  }
}