/**
 * NowPayments API error.
 *
 * Thrown for any non-2xx response returned by the NowPayments API.
 * Exposes the HTTP status, the raw error body (when available) and the
 * original request that triggered the failure for easier debugging.
 */
export declare class NowPaymentsError extends Error {
    /** HTTP status code returned by the API. `0` for network/transport errors. */
    readonly status: number;
    /** Raw error body returned by the API, when available. */
    readonly body: unknown;
    /** Identifier of the request that failed (for support/debugging). */
    readonly requestId?: string;
    constructor(message: string, options: {
        status: number;
        body?: unknown;
        requestId?: string;
    });
}
/**
 * Error thrown when a request is aborted by the caller (via `AbortSignal`)
 * or exceeds the configured timeout.
 */
export declare class NowPaymentsAbortError extends Error {
    constructor(message?: string);
}
//# sourceMappingURL=errors.d.ts.map