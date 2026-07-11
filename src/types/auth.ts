/**
 * Authentication-related types for the NowPayments API.
 */


/** API status response (returned by `GET /v1/status`). */
export interface ApiStatus {
  /** Status message, e.g. "OK". */
  message: string;
}

/** Authentication status response (returned by `GET /v1/auth/decoded`). */
export interface AuthStatus {
  /** Whether the API key is valid. */
  result: boolean;
  /** Message describing the result. */
  message?: string;
  code?: number;
}

/** JWT token response from `/auth`. */
export interface JwtToken {
  token: string;
}

/** API key payload for `/auth`. */
export interface AuthPayload {
  email: string;
  password: string;
}

/** Payment verification result. */
export interface PaymentVerification {
  /** Whether the payment verification succeeded. */
  result: boolean;
  message?: string;
  code?: number;
}