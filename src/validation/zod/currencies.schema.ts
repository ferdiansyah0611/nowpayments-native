/**
 * Zod schemas for the currencies resource (`client.currencies`).
 *
 * All endpoints require an API key.
 *
 * - `currenciesListParamsSchema`         — `GET /v1/currencies`
 * - `currenciesListResponseSchema`       — `{ currencies: string[] }`
 * - `fullCurrenciesResponseSchema`       — `GET /v1/full-currencies`
 * - `currenciesCheckedResponseSchema`    — `GET /v1/merchant/coins`
 */
import { z } from "zod";

/** Params for `GET /v1/currencies`. */
export const currenciesListParamsSchema = z.strictObject({
  /** Only return fixed-rate currencies (with min/max exchange amounts). */
  fixed_rate: z.boolean().optional(),
});

/** Response from `GET /v1/currencies`. */
export const currenciesListResponseSchema = z.looseObject({
  currencies: z.array(z.string()),
});

/** A single detailed currency record from `GET /v1/full-currencies`. */
export const fullCurrencySchema = z.looseObject({
  id: z.number(),
  code: z.string(),
  name: z.string(),
  enable: z.boolean(),
  wallet_regex: z.string(),
  priority: z.number(),
  extra_id_exists: z.boolean(),
  extra_id_regex: z.string().nullable(),
  logo_url: z.string(),
  track: z.boolean(),
  cg_id: z.string(),
  is_maxlimit: z.boolean(),
  network: z.string(),
  smart_contract: z.string().nullable(),
  network_precision: z.string(),
  explorer_link_hash: z.string().nullable(),
  precision: z.number(),
  ticker: z.string(),
  is_defi: z.boolean(),
  is_popular: z.boolean(),
  is_stable: z.boolean(),
  available_for_to_conversion: z.boolean(),
  trust_wallet_id: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  available_for_payment: z.boolean(),
  available_for_payout: z.boolean(),
  extra_id_optional: z.boolean(),
});

/** Response from `GET /v1/full-currencies`. */
export const fullCurrenciesResponseSchema = z.looseObject({
  currencies: z.array(fullCurrencySchema),
});

/** Response from `GET /v1/merchant/coins` (coins enabled in your account). */
export const currenciesCheckedResponseSchema = z.looseObject({
  selectedCurrencies: z.array(z.string()),
});

export type CurrenciesListParamsInput = z.infer<
  typeof currenciesListParamsSchema
>;
export type CurrenciesListOutput = z.infer<typeof currenciesListResponseSchema>;
export type FullCurrencyOutput = z.infer<typeof fullCurrencySchema>;
export type FullCurrenciesOutput = z.infer<
  typeof fullCurrenciesResponseSchema
>;
export type CurrenciesCheckedOutput = z.infer<
  typeof currenciesCheckedResponseSchema
>;
