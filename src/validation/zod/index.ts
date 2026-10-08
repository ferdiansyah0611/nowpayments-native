/**
 * Zod validation schemas for all NowPayments resources.
 *
 * Request payloads use `z.strictObject` (unknown keys throw) so typos
 * fail fast. Response schemas use `z.looseObject` (unknown keys kept)
 * so the API can add fields without breaking parsing.
 */
export * from "./common.schema.js";
export * from "./auth.schema.js";
export * from "./currencies.schema.js";
export * from "./conversions.schema.js";
export * from "./payments.schema.js";
export * from "./payouts.schema.js";
export * from "./customers.schema.js";
export * from "./subscriptions.schema.js";
