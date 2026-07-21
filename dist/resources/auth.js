import { Resource } from "./main.js";
/**
 * Authentication & API status endpoints.
 *
 * - `GET /v1/status` — public API health check (no auth required).
 * - `POST /v1/auth` — exchange email/password for a JWT bearer token.
 */
export class AuthResource extends Resource {
    /**
     * This is a method to get information about the current state of the API.
     * If everything is OK, you will receive an "OK" message. Otherwise, you'll see some error.
    */
    status(options) {
        return this.http.get("/v1/status", undefined, options);
    }
    /**
     * Authentication method for obtaining a JWT token. You should specify your email and password which you are using for signing in into dashboard.
     * JWT token will be required for using 'Get list of payments' and 'Create payout' endpoints. For security reasons, JWT tokens expire in 5 minutes.
     */
    token(payload, options) {
        return this.http.post("/v1/auth", payload, options);
    }
}
//# sourceMappingURL=auth.js.map