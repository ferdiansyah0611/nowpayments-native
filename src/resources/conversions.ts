import type { HttpClient, RequestOptions, QueryParams } from "../http.js";
import type { Conversion } from "../types/conversions.types.js";

/** Base class for resource groups — holds a reference to the HTTP client. */
abstract class Resource {
  protected readonly http: HttpClient;
  constructor(http: HttpClient) {
    this.http = http;
  }
}

/**
 * Currency conversion endpoints.
 *
 * - `POST v1/conversion` — create a conversion (JWT).
 * - `GET v1/conversion/:conversion_id` — get a single conversion (JWT).
 * - `GET v1/conversion` — list conversions with filters (JWT).
 */
export class ConversionResource extends Resource {
  /**
   * Creates a new currency conversion.
   * Requires JWT authentication.
   */
  create(payload: Conversion.CreatePayload, options?: RequestOptions): Promise<Conversion.Response> {
    return this.http.post<Conversion.Response>(
      "v1/conversion",
      payload as unknown as Record<string, unknown>,
      options,
    );
  }

  /**
   * Gets a single conversion by its id.
   * Requires JWT authentication.
   */
  get(conversionId: string, options?: RequestOptions): Promise<Conversion.Response> {
    return this.http.get<Conversion.Response>(
      `v1/conversion/${conversionId}`,
      undefined,
      options,
    );
  }

  /**
   * Lists conversions with optional filters.
   * Requires JWT authentication.
   */
  list(params?: Conversion.ListParams, options?: RequestOptions): Promise<Conversion.ListResponse> {
    return this.http.get<Conversion.ListResponse>(
      "v1/conversion",
      params as QueryParams | undefined,
      options,
    );
  }
}