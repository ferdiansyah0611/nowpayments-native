/**
 * Shared zod schemas for the NowPayments API.
 */
import { z } from "zod";

/** ISO 4217 fiat currency code (e.g. `usd`, `eur`). */
export const fiatCurrencySchema = z.string().min(1);

/** Crypto asset ticker (e.g. `btc`, `eth`, `usdttrc20`). */
export const cryptoCurrencySchema = z.string().min(1);

/** Monetary amount — NowPayments accepts strings or numbers. */
export const moneySchema = z.union([z.string(), z.number()]);

/** ISO 8601 timestamp (kept loose — the API emits varied formats). */
export const timestampSchema = z.string();

/** Fee breakdown returned in payment records and IPN webhooks. */
export const feeSchema = z.looseObject({
  currency: cryptoCurrencySchema.optional(),
  depositFee: z.number().optional(),
  withdrawalFee: z.number().optional(),
  serviceFee: z.number().optional(),
});

/** Balance for a single currency (available + pending). */
export const currencyBalanceSchema = z.looseObject({
  amount: moneySchema,
  pendingAmount: moneySchema,
});
