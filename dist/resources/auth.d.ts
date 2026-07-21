import type { RequestOptions } from "../http.js";
import type { ApiStatus, AuthPayload, JwtToken } from "../types/main.types.js";
import { Resource } from "./main.js";
/**
 * Authentication & API status endpoints.
 *
 * - `GET /v1/status` — public API health check (no auth required).
 * - `POST /v1/auth` — exchange email/password for a JWT bearer token.
 */
export declare class AuthResource extends Resource {
    /**
     * This is a method to get information about the current state of the API.
     * If everything is OK, you will receive an "OK" message. Otherwise, you'll see some error.
    */
    status(options?: RequestOptions): Promise<ApiStatus>;
    /**
     * Authentication method for obtaining a JWT token. You should specify your email and password which you are using for signing in into dashboard.
     * JWT token will be required for using 'Get list of payments' and 'Create payout' endpoints. For security reasons, JWT tokens expire in 5 minutes.
     */
    token(payload: AuthPayload, options?: RequestOptions): Promise<JwtToken>;
}
//# sourceMappingURL=auth.d.ts.map