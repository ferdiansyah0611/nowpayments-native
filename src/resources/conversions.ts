import type { RequestOptions, QueryParams } from "../http.js";
import type { Conversion } from "../types/conversions.types.js";
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
  create(payload: Conversion.CreatePayload, options?: RequestOptions): Promise<Conversion.Response> {
    return this.http.post<Conversion.Response>(
      "v1/conversion",
      payload as unknown as Record<string, unknown>,
      options,
    );
  }

  /**
   * This method allows you to check the status of a certain conversion.
   * @requires JWT
   */
  get(conversionId: string, options?: RequestOptions): Promise<Conversion.Response> {
    return this.http.get<Conversion.Response>(
      `v1/conversion/${conversionId}`,
      undefined,
      options,
    );
  }

  /**
   * This endpoint returns you the list of your conversions with the essential info for each one.
   * @requires JWT
   */
  list(params?: Conversion.ListParams, options?: RequestOptions): Promise<Conversion.ListResponse> {
    return this.http.get<Conversion.ListResponse>(
      "v1/conversion",
      params as QueryParams | undefined,
      options,
    );
  }
}