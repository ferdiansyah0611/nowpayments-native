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
export function sortObject<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(sortObject) as unknown as T;

  const sortedKeys = Object.keys(obj as Record<string, unknown>).sort();
  const result: Record<string, unknown> = {};
  for (const key of sortedKeys) {
    const value = (obj as Record<string, unknown>)[key];
    result[key] = value !== null && typeof value === "object" ? sortObject(value) : value;
  }
  return result as T;
}

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
export async function verifyIpnSignature(
  payload: object,
  signature: string,
  ipnSecret: string,
  hmacImpl?: (data: string, secret: string) => Promise<string>,
): Promise<boolean> {
  if (!payload || !signature || !ipnSecret) return false;

  const sorted = sortObject(payload);
  const body = JSON.stringify(sorted);

  const expected = hmacImpl
    ? await hmacImpl(body, ipnSecret)
    : await defaultHmacSha512(body, ipnSecret);

  return timingSafeEqual(expected, signature.toLowerCase());
}

/** Default HMAC-SHA512 implementation using Web Crypto. */
async function defaultHmacSha512(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return bufferToHex(signature);
}

/** Converts an `ArrayBuffer` to a lowercase hex string. */
function bufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let hex = "";
  for (const byte of bytes) {
    hex += byte.toString(16).padStart(2, "0");
  }
  return hex;
}

/** Constant-time string comparison to mitigate timing attacks. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/** Re-exports for convenience. */
export type { IpnNotification };
