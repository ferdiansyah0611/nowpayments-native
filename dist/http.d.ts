/** HTTP method supported by the client. */
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
/** Query string parameters. `undefined` and `null` values are skipped. */
export type QueryParams = Record<string, string | number | boolean | null | undefined>;
/** Request body. Anything `fetch` can serialize via `JSON.stringify`. */
export type RequestBody = Record<string, unknown> | unknown[];
/** Options accepted by every request performed by the client. */
export interface RequestOptions {
    /** Abort the request via `AbortController.signal`. */
    signal?: AbortSignal;
    /** Per-request timeout in milliseconds. Overrides the client default. */
    timeoutMs?: number;
    /** Custom headers merged on top of the client defaults. */
    headers?: Record<string, string>;
}
/** Resolved client configuration. */
export interface HttpClientConfig {
    baseUrl: string;
    apiKey?: string;
    jwt?: string;
    timeoutMs: number;
    /** Custom `fetch` implementation (e.g. for tests or edge runtimes). */
    fetchImpl?: typeof fetch;
}
/**
 * Low-level HTTP client for the NowPayments API.
 *
 * Handles:
 *  - base URL composition
 *  - authentication headers (API key or JWT bearer)
 *  - JSON serialization / parsing
 *  - query string building
 *  - timeouts via `AbortController`
 *  - error normalization into {@link NowPaymentsError}
 */
export declare class HttpClient {
    private readonly config;
    constructor(config: HttpClientConfig);
    /** Returns a new client with the given JWT applied (does not mutate). */
    withJwt(jwt: string): HttpClient;
    /** Returns a new client with the given API key applied (does not mutate). */
    withApiKey(apiKey: string): HttpClient;
    /** Returns a snapshot of the current client configuration. */
    getConfig(): Readonly<HttpClientConfig>;
    /** Performs a GET request. */
    get<T>(path: string, query?: QueryParams, options?: RequestOptions): Promise<T>;
    /** Performs a POST request. */
    post<T>(path: string, body?: RequestBody, options?: RequestOptions): Promise<T>;
    /** Performs a PUT request. */
    put<T>(path: string, body?: RequestBody, options?: RequestOptions): Promise<T>;
    /** Performs a PATCH request. */
    patch<T>(path: string, body?: RequestBody, options?: RequestOptions): Promise<T>;
    /** Performs a DELETE request. */
    delete<T>(path: string, query?: QueryParams, options?: RequestOptions): Promise<T>;
    /** Core request executor. */
    private request;
    /** Builds the full URL with query string. */
    private buildUrl;
    /** Builds the request headers, including auth. */
    private buildHeaders;
    /** Merges the caller's signal with a timeout signal. */
    private mergeSignals;
    /** Converts a non-2xx response into a {@link NowPaymentsError}. */
    private toError;
}
//# sourceMappingURL=http.d.ts.map