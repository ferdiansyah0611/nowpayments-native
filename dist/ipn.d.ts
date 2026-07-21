import type { IpnNotification } from "./types/main.types.js";
/**
 * Recursively sorts an object's keys (and nested objects') in alphabetical
 * order, matching the algorithm documented by NowPayments for IPN signature
 * verification.
 *
 * Mirrors the official Node.js example:
 * ```js
 * function sortObject(obj) {
 *   return Object.keys(obj).sort().reduce((result, key) => {
 *     result[key] = (obj[key] && typeof obj[key] === 'object')
 *       ? sortObject(obj[key]) : obj[key]
 *     return result
 *   }, {})
 * }
 * ```
 */
export declare function sortObject<T>(obj: T): T;
/**
 * Verifies the HMAC-SHA512 signature of an IPN webhook payload.
 *
 * NowPayments signs each IPN request with the HMAC of the request body
 * (with keys sorted recursively) using your IPN secret key. The signature is
 * sent in the `x-nowpayments-sig` header.
 *
 * Per the official documentation:
 * 1. Sort the POST request by keys (recursively) and convert it to a string
 *    using `JSON.stringify(params, Object.keys(params).sort())` or equivalent;
 * 2. Sign the string with the IPN-secret key using HMAC-SHA512;
 * 3. Compare the signed string with the `x-nowpayments-sig` header value.
 *
 * @param payload Parsed webhook body (object). Will be sorted before signing.
 * @param signature Value of the `x-nowpayments-sig` header.
 * @param ipnSecret The IPN secret key configured in your NowPayments account.
 * @param hmacImpl Optional HMAC function (defaults to Web Crypto `SubtleCrypto`).
 *                 Override for runtimes without `crypto.subtle`.
 *
 * @returns `true` if the signature matches, `false` otherwise.
 */
export declare function verifyIpnSignature(payload: object, signature: string, ipnSecret: string, hmacImpl?: (data: string, secret: string) => Promise<string>): Promise<boolean>;
/** Re-exports for convenience. */
export type { IpnNotification };
//# sourceMappingURL=ipn.d.ts.map