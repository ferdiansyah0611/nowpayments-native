/**
 * NowPayments.io API client for TypeScript.
 *
 * Type-safe, dependency-free (uses the platform `fetch`), and designed for
 * edge runtimes (Cloudflare Workers, Vercel Edge, Deno, Bun, browsers).
 *
 * @example
 * ```ts
 * import { NowPayments } from "nowpayments-native";
 *
 * const client = new NowPayments({ apiKey: process.env.NOWPAYMENTS_API_KEY });
 *
 * const payment = await client.payments.create({
 *   price_amount: 10,
 *   price_currency: "usd",
 *   pay_currency: "btc",
 *   order_id: "order-123",
 * });
 * ```
 */
export { NowPayments } from "./client.js";
export { HttpClient } from "./http.js";
export { NowPaymentsError, NowPaymentsAbortError } from "./errors.js";
export { AuthResource, CurrenciesResource, CustomerResource, PaymentsResource, PayoutsResource, SubscriptionResource, ConversionResource, } from "./resources/index.js";
export { verifyIpnSignature, sortObject } from "./ipn.js";
//# sourceMappingURL=index.js.map