/**
 * NowPayments API error.
 *
 * Thrown for any non-2xx response returned by the NowPayments API.
 * Exposes the HTTP status, the raw error body (when available) and the
 * original request that triggered the failure for easier debugging.
 */
export class NowPaymentsError extends Error {
    /** HTTP status code returned by the API. `0` for network/transport errors. */
    status;
    /** Raw error body returned by the API, when available. */
    body;
    /** Identifier of the request that failed (for support/debugging). */
    requestId;
    constructor(message, options) {
        super(message);
        this.name = "NowPaymentsError";
        this.status = options.status;
        this.body = options.body;
        this.requestId = options.requestId;
        // Restore prototype chain (extends Error breaks under ES5 targets / TS strict).
        Object.setPrototypeOf(this, NowPaymentsError.prototype);
    }
}
/**
 * Error thrown when a request is aborted by the caller (via `AbortSignal`)
 * or exceeds the configured timeout.
 */
export class NowPaymentsAbortError extends Error {
    constructor(message = "Request aborted") {
        super(message);
        this.name = "NowPaymentsAbortError";
        Object.setPrototypeOf(this, NowPaymentsAbortError.prototype);
    }
}
//# sourceMappingURL=errors.js.map