import { Resource } from "./main.js";
/**
 * Currency conversion endpoints.
 *
 * - `POST v1/conversion` — create a conversion (JWT).
 * - `GET v1/conversion/:conversion_id` — get a single conversion (JWT).
 * - `GET v1/conversion` — list conversions with filters (JWT).
 */
export class ConversionResource extends Resource {
    /**
     * This endpoint allows you to create conversions within your custody account.
     * @requires JWT
     */
    create(payload, options) {
        return this.http.post("v1/conversion", payload, options);
    }
    /**
     * This method allows you to check the status of a certain conversion.
     * @requires JWT
     */
    get(conversionId, options) {
        return this.http.get(`v1/conversion/${conversionId}`, undefined, options);
    }
    /**
     * This endpoint returns you the list of your conversions with the essential info for each one.
     * @requires JWT
     */
    list(params, options) {
        return this.http.get("v1/conversion", params, options);
    }
}
//# sourceMappingURL=conversions.js.map