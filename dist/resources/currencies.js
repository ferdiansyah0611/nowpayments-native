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
    list(params, options) {
        return this.http.get("/v1/currencies", params, options);
    }
    /**
     * This is a method to obtain detailed information about all cryptocurrencies available for payments.
     * @requires APIKey
     */
    full(options) {
        return this.http.get("/v1/full-currencies", undefined, options);
    }
    /**
     * This is a method for obtaining information about the cryptocurrencies available for payments.
     * Shows the coins you set as available for payments in the "coins settings" tab on your personal account.
     * @requires APIKey
     */
    checked(options) {
        return this.http.get("/v1/merchant/coins", undefined, options);
    }
}
//# sourceMappingURL=currencies.js.map