import type { RequestOptions } from "../http.js";
import type { Currencies } from "../types/payments.types.js";
import { Resource } from "./main.js";
/**
 * Currency & estimate endpoints.
 *
 * - `GET /v1/currencies` — list available currencies (optionally fixed-rate).
 * - `GET /v1/full-currencies` — detailed currency info (name, logo, network, …).
 * - `GET /v1/merchant/coins` — currencies enabled in the merchant account.
 */
export declare class CurrenciesResource extends Resource {
    /**
     * This is a method for obtaining information about all cryptocurrencies available for payments for your current setup.
     * @requires APIKey
     */
    list(params?: Currencies.ListParams, options?: RequestOptions): Promise<Currencies.ListResponse>;
    /**
     * This is a method to obtain detailed information about all cryptocurrencies available for payments.
     * @requires APIKey
     */
    full(options?: RequestOptions): Promise<Currencies.FullCurrenciesResponse>;
    /**
     * This is a method for obtaining information about the cryptocurrencies available for payments.
     * Shows the coins you set as available for payments in the "coins settings" tab on your personal account.
     * @requires APIKey
     */
    checked(options?: RequestOptions): Promise<Currencies.CheckedResponse>;
}
//# sourceMappingURL=currencies.d.ts.map