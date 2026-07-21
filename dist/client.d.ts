import { AuthResource, CurrenciesResource, CustomerResource, PaymentsResource, PayoutsResource, SubscriptionResource, ConversionResource } from "./resources/index.js";
/** Options accepted by the {@link NowPayments} client constructor. */
export interface NowPaymentsOptions {
    /** API key issued by NowPayments (required for most endpoints). */
    apiKey?: string;
    /** JWT bearer token (alternative to API key, obtained via `/auth`). */
    jwt?: string;
    /**
     * Base URL of the API.
     * @default "https://api.nowpayments.io"
     */
    baseUrl?: string;
    /** Default request timeout in milliseconds. @default 30_000 */
    timeoutMs?: number;
    /** Custom `fetch` implementation (tests, edge runtimes). */
    fetchImpl?: typeof fetch;
}
/**
 * Type-safe client for the NowPayments.io API.
 *
 * @example
 * ```ts
 * const client = new NowPayments({ apiKey: process.env.NOWPAYMENTS_API_KEY });
 * const payment = await client.payments.create({
 *   price_amount: 10,
 *   price_currency: "usd",
 *   pay_currency: "btc",
 * });
 * ```
 */
export declare class NowPayments {
    private readonly http;
    readonly auth: AuthResource;
    readonly currencies: CurrenciesResource;
    readonly payments: PaymentsResource;
    readonly payouts: PayoutsResource;
    readonly customers: CustomerResource;
    readonly subscriptions: SubscriptionResource;
    readonly conversions: ConversionResource;
    constructor(options?: NowPaymentsOptions);
    /** Returns a new client authenticated with the given JWT. */
    withJwt(jwt: string): NowPayments;
    /** Returns a new client authenticated with the given API key. */
    withApiKey(apiKey: string): NowPayments;
}
export default NowPayments;
//# sourceMappingURL=client.d.ts.map