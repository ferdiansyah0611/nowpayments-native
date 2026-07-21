import { NowPaymentsAbortError, NowPaymentsError } from "./errors.js";
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
    config;
    constructor(config) {
        this.config = config;
    }
    /** Returns a new client with the given JWT applied (does not mutate). */
    withJwt(jwt) {
        return new HttpClient({ ...this.config, jwt });
    }
    /** Returns a new client with the given API key applied (does not mutate). */
    withApiKey(apiKey) {
        return new HttpClient({ ...this.config, apiKey });
    }
    /** Returns a snapshot of the current client configuration. */
    getConfig() {
        return { ...this.config };
    }
    /** Performs a GET request. */
    get(path, query, options) {
        return this.request({ method: "GET", path, query, options });
    }
    /** Performs a POST request. */
    post(path, body, options) {
        return this.request({ method: "POST", path, body, options });
    }
    /** Performs a PUT request. */
    put(path, body, options) {
        return this.request({ method: "PUT", path, body, options });
    }
    /** Performs a PATCH request. */
    patch(path, body, options) {
        return this.request({ method: "PATCH", path, body, options });
    }
    /** Performs a DELETE request. */
    delete(path, query, options) {
        return this.request({ method: "DELETE", path, query, options });
    }
    /** Core request executor. */
    async request(req) {
        const url = this.buildUrl(req.path, req.query);
        const headers = this.buildHeaders(req.options?.headers);
        const body = req.body !== undefined ? JSON.stringify(req.body) : undefined;
        const fetchImpl = this.config.fetchImpl ?? fetch;
        const timeoutMs = req.options?.timeoutMs ?? this.config.timeoutMs;
        // Combine the caller's signal with our timeout signal.
        const signal = this.mergeSignals(req.options?.signal, timeoutMs);
        let response;
        try {
            response = await fetchImpl(url, {
                method: req.method,
                headers,
                body,
                signal,
            });
        }
        catch (err) {
            if (err instanceof NowPaymentsAbortError)
                throw err;
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
            return undefined;
        }
        const text = await response.text();
        if (text.length === 0) {
            return undefined;
        }
        try {
            return JSON.parse(text);
        }
        catch {
            // Not JSON — return raw text for the caller to handle.
            return text;
        }
    }
    /** Builds the full URL with query string. */
    buildUrl(path, query) {
        const base = this.config.baseUrl.replace(/\/+$/, "");
        const cleanPath = path.startsWith("/") ? path : `/${path}`;
        const url = `${base}${cleanPath}`;
        if (!query)
            return url;
        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(query)) {
            if (value === null || value === undefined)
                continue;
            params.append(key, String(value));
        }
        const qs = params.toString();
        return qs.length > 0 ? `${url}?${qs}` : url;
    }
    /** Builds the request headers, including auth. */
    buildHeaders(extra) {
        const headers = {
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
    mergeSignals(callerSignal, timeoutMs) {
        const controller = new AbortController();
        const signals = [];
        if (callerSignal)
            signals.push(callerSignal);
        if (timeoutMs && timeoutMs > 0) {
            const timer = setTimeout(() => controller.abort(), timeoutMs);
            // Allow the timer to be unref'd in Node without keeping the event loop alive.
            // @ts-ignore
            if (typeof timer === "object" && "unref" in timer && typeof timer.unref === "function") {
                // @ts-ignore
                timer.unref();
            }
        }
        // Propagate abort from caller signal.
        if (callerSignal) {
            if (callerSignal.aborted)
                controller.abort();
            else
                callerSignal.addEventListener("abort", () => controller.abort(), { once: true });
        }
        return controller.signal;
    }
    /** Converts a non-2xx response into a {@link NowPaymentsError}. */
    async toError(response) {
        const requestId = response.headers.get("x-request-id") ?? undefined;
        let body;
        try {
            body = await response.json();
        }
        catch {
            try {
                body = await response.text();
            }
            catch {
                body = undefined;
            }
        }
        const message = typeof body === "object" && body !== null && "message" in body
            ? String(body.message)
            : `HTTP ${response.status} ${response.statusText}`;
        return new NowPaymentsError(message, {
            status: response.status,
            body,
            requestId,
        });
    }
}
//# sourceMappingURL=http.js.map