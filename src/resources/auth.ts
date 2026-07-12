import type { HttpClient, RequestOptions } from "../http.js";
import type { ApiStatus, AuthPayload, AuthStatus, JwtToken } from "../types/main.types.js";

/** Base class for resource groups — holds a reference to the HTTP client. */
abstract class Resource {
  protected readonly http: HttpClient;
  constructor(http: HttpClient) {
    this.http = http;
  }
}

/**
 * Authentication & API status endpoints.
 *
 * - `GET /v1/status` — public API health check (no auth required).
 * - `POST /v1/auth` — exchange email/password for a JWT bearer token.
 * - `GET /v1/auth/decoded` — validate the configured API key.
 */
export class AuthResource extends Resource {
  /** Checks API availability. Public endpoint, no API key required. */
  status(options?: RequestOptions): Promise<ApiStatus> {
    return this.http.get<ApiStatus>("/v1/status", undefined, options);
  }

  /** Validates the configured API key. */
  apiKeyStatus(options?: RequestOptions): Promise<AuthStatus> {
    return this.http.get<AuthStatus>("/v1/auth/decoded", undefined, options);
  }

  /** Exchanges email/password for a JWT bearer token. */
  token(payload: AuthPayload, options?: RequestOptions): Promise<JwtToken> {
    return this.http.post<JwtToken>(
      "/v1/auth",
      payload as unknown as Record<string, unknown>,
      options,
    );
  }
}