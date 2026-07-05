import { NowPaymentsAbortError, NowPaymentsError } from "./errors.js";

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

/** Internal normalized request descriptor. */
interface InternalRequest {
  method: HttpMethod;
  path: string;
  query?: QueryParams;
  body?: RequestBody;
  options?: RequestOptions;
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
export class HttpClient {
  private readonly config: HttpClientConfig;

  constructor(config: HttpClientConfig) {
    this.config = config;
  }

  /** Returns a new client with the given JWT applied (does not mutate). */
  withJwt(jwt: string): HttpClient {
    return new HttpClient({ ...this.config, jwt });
  }

  /** Returns a new client with the given API key applied (does not mutate). */
  withApiKey(apiKey: string): HttpClient {
    return new HttpClient({ ...this.config, apiKey });
  }

  /** Returns a snapshot of the current client configuration. */
  getConfig(): Readonly<HttpClientConfig> {
    return { ...this.config };
  }

  /** Performs a GET request. */
  get<T>(path: string, query?: QueryParams, options?: RequestOptions): Promise<T> {
    return this.request<T>({ method: "GET", path, query, options });
  }

  /** Performs a POST request. */
  post<T>(path: string, body?: RequestBody, options?: RequestOptions): Promise<T> {
    return this.request<T>({ method: "POST", path, body, options });
  }

  /** Performs a PUT request. */
  put<T>(path: string, body?: RequestBody, options?: RequestOptions): Promise<T> {
    return this.request<T>({ method: "PUT", path, body, options });
  }

  /** Performs a PATCH request. */
  patch<T>(path: string, body?: RequestBody, options?: RequestOptions): Promise<T> {
    return this.request<T>({ method: "PATCH", path, body, options });
  }

  /** Performs a DELETE request. */
  delete<T>(path: string, query?: QueryParams, options?: RequestOptions): Promise<T> {
    return this.request<T>({ method: "DELETE", path, query, options });
  }

  /** Core request executor. */
  private async request<T>(req: InternalRequest): Promise<T> {
    const url = this.buildUrl(req.path, req.query);
    const headers = this.buildHeaders(req.options?.headers);
    const body = req.body !== undefined ? JSON.stringify(req.body) : undefined;

    const fetchImpl = this.config.fetchImpl ?? fetch;
    const timeoutMs = req.options?.timeoutMs ?? this.config.timeoutMs;

    // Combine the caller's signal with our timeout signal.
    const signal = this.mergeSignals(req.options?.signal, timeoutMs);

    let response: Response;
    try {
      response = await fetchImpl(url, {
        method: req.method,
        headers,
        body,
        signal,
      });
    } catch (err) {
      if (err instanceof NowPaymentsAbortError) throw err;
      if (err instanceof Error && err.name === "AbortError") {
        throw new NowPaymentsAbortError();
      }
      throw new NowPaymentsError("Network request failed", { status: 0, body: err });
    }

    if (!response.ok) {
      throw await this.toError(response);
    }

    // 204 No Content / empty body
    if (response.status === 204) {
      return undefined as T;
    }

    const text = await response.text();
    if (text.length === 0) {
      return undefined as T;
    }

    try {
      return JSON.parse(text) as T;
    } catch {
      // Not JSON — return raw text for the caller to handle.
      return text as unknown as T;
    }
  }

  /** Builds the full URL with query string. */
  private buildUrl(path: string, query?: QueryParams): string {
    const base = this.config.baseUrl.replace(/\/+$/, "");
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    const url = `${base}${cleanPath}`;

    if (!query) return url;

    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value === null || value === undefined) continue;
      params.append(key, String(value));
    }
    const qs = params.toString();
    return qs.length > 0 ? `${url}?${qs}` : url;
  }

  /** Builds the request headers, including auth. */
  private buildHeaders(extra?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    if (this.config.apiKey) {
      headers["x-api-key"] = this.config.apiKey;
    }
    if (this.config.jwt) {
      headers["Authorization"] = `Bearer ${this.config.jwt}`;
    }

    return { ...headers, ...(extra ?? {}) };
  }

  /** Merges the caller's signal with a timeout signal. */
  private mergeSignals(callerSignal?: AbortSignal, timeoutMs?: number): AbortSignal {
    const controller = new AbortController();

    const signals: AbortSignal[] = [];
    if (callerSignal) signals.push(callerSignal);
    if (timeoutMs && timeoutMs > 0) {
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      // Allow the timer to be unref'd in Node without keeping the event loop alive.
      // @ts-ignore
      if (typeof timer === "object" && "unref" in timer && typeof timer.unref === "function") {
        // @ts-ignore
        (timer as NodeJS.Timeout).unref();
      }
    }

    // Propagate abort from caller signal.
    if (callerSignal) {
      if (callerSignal.aborted) controller.abort();
      else callerSignal.addEventListener("abort", () => controller.abort(), { once: true });
    }

    return controller.signal;
  }

  /** Converts a non-2xx response into a {@link NowPaymentsError}. */
  private async toError(response: Response): Promise<NowPaymentsError> {
    const requestId = response.headers.get("x-request-id") ?? undefined;
    let body: unknown;
    try {
      body = await response.json();
    } catch {
      try {
        body = await response.text();
      } catch {
        body = undefined;
      }
    }

    const message =
      typeof body === "object" && body !== null && "message" in body
        ? String((body as { message: unknown }).message)
        : `HTTP ${response.status} ${response.statusText}`;

    return new NowPaymentsError(message, {
      status: response.status,
      body,
      requestId,
    });
  }
}
