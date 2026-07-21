import type { RequestOptions } from "../http.js";
import type { Conversion } from "../types/conversions.types.js";
import { Resource } from "./main.js";
/**
 * Currency conversion endpoints.
 *
 * - `POST v1/conversion` — create a conversion (JWT).
 * - `GET v1/conversion/:conversion_id` — get a single conversion (JWT).
 * - `GET v1/conversion` — list conversions with filters (JWT).
 */
export declare class ConversionResource extends Resource {
    /**
     * This endpoint allows you to create conversions within your custody account.
     * @requires JWT
     */
    create(payload: Conversion.CreatePayload, options?: RequestOptions): Promise<Conversion.Response>;
    /**
     * This method allows you to check the status of a certain conversion.
     * @requires JWT
     */
    get(conversionId: string, options?: RequestOptions): Promise<Conversion.Response>;
    /**
     * This endpoint returns you the list of your conversions with the essential info for each one.
     * @requires JWT
     */
    list(params?: Conversion.ListParams, options?: RequestOptions): Promise<Conversion.ListResponse>;
}
//# sourceMappingURL=conversions.d.ts.map