import type { HttpClient, RequestOptions, QueryParams } from "../http.js";
import type {
  CreateConversionPayload,
  ConversionResponse,
  ListConversionsParams,
  ListConversionsResponse,
} from "../types.js";

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
  create(payload: CreateConversionPayload, options?: RequestOptions): Promise<ConversionResponse> {
    return this.http.post<ConversionResponse>(
      "v1/conversion",
      payload as unknown as Record<string, unknown>,
      options,
    );
  }

  /**
   * Gets a single conversion by its id.
   * Requires JWT authentication.
   */
  get(conversionId: string, options?: RequestOptions): Promise<ConversionResponse> {
    return this.http.get<ConversionResponse>(
      `v1/conversion/${conversionId}`,
      undefined,
      options,
    );
  }

  /**
   * Lists conversions with optional filters.
   * Requires JWT authentication.
   */
  list(params?: ListConversionsParams, options?: RequestOptions): Promise<ListConversionsResponse> {
    return this.http.get<ListConversionsResponse>(
      "v1/conversion",
      params as QueryParams | undefined,
      options,
    );
  }
}