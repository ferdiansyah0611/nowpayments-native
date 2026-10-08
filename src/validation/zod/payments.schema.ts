/**
 * Zod schemas for the payments resource (`client.payments`).
 *
 * - `paymentCreatePayloadSchema`  — `POST /v1/payment`
 * - `paymentSchema`               — payment record
 * - `paymentListParamsSchema`     — `GET /v1/payment` (requires JWT)
 * - `invoiceCreatePayloadSchema`  — `POST /v1/invoice`
 * - `invoiceSchema`               — invoice record
 * - `accountBalanceSchema`        — `GET /v1/balance`
 * - `validateAddressPayloadSchema`— `POST /v1/payout/validate-address`
 */
import { z } from "zod";
import {
  cryptoCurrencySchema,
  fiatCurrencySchema,
  feeSchema,
  moneySchema,
} from "./common.schema.js";

/** Payment lifecycle status. */
export const paymentStatusSchema = z.enum([
  "waiting",
  "confirming",
  "confirmed",
  "sending",
  "partially_paid",
  "finished",
  "failed",
  "refunded",
  "expired",
]);

/** Payload for `POST /v1/payment`. */
export const paymentCreatePayloadSchema = z.strictObject({
  /** Fiat equivalent of the price to be paid in crypto. */
  price_amount: moneySchema,
  /** Fiat currency (`usd`, `eur`, …). */
  price_currency: fiatCurrencySchema,
  /** Crypto currency (`btc`, `eth`, …). */
  pay_currency: cryptoCurrencySchema,
  /** Crypto amount (overrides price calculation). */
  pay_amount: moneySchema.optional(),
  /** Webhook URL (must contain http/https). */
  ipn_callback_url: z.string().url().optional(),
  /** Your internal order ID. */
  order_id: z.string().optional(),
  /** Your internal order description. */
  order_description: z.string().optional(),
  /** Create another payment for this purchase. */
  purchase_id: z.string().optional(),
  /** External payout address. */
  payout_address: z.string().optional(),
  /** Currency of the external payout address. */
  payout_currency: cryptoCurrencySchema.optional(),
  /** Extra id / memo / tag for the payout address. */
  payout_extra_id: z.string().optional(),
  /** Fixed-rate exchange. */
  fixed_rate: z.boolean().optional(),
  is_fixed_rate: z.boolean().optional(),
  /** Exchange fee paid by the user. */
  is_fee_paid_by_user: z.boolean().optional(),
});

/** A single payment record. */
export const paymentSchema = z.looseObject({
  payment_id: z.number(),
  payment_status: paymentStatusSchema,
  pay_address: z.string(),
  pay_amount: moneySchema,
  actually_paid: moneySchema.optional(),
  actually_paid_at_fiat: moneySchema.optional(),
  pay_currency: cryptoCurrencySchema,
  price_amount: moneySchema,
  price_currency: fiatCurrencySchema,
  order_id: z.string().nullable(),
  order_description: z.string().nullable(),
  purchase_id: z.string().nullable(),
  outcome_amount: moneySchema.optional(),
  outcome_currency: cryptoCurrencySchema.optional(),
  payin_extra_id: z.string().nullable(),
  payin_hash: z.string().optional(),
  payout_hash: z.string().optional(),
  parent_payment_id: z.number().nullable(),
  invoice_id: z.string().nullable(),
  payment_extra_ids: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  burning_percent: z.number().optional(),
  fee: feeSchema.optional(),
  network: z.string().optional(),
  result_url: z.string().optional(),
  unfix_address_url: z.string().optional(),
  ipn_callback_url: z.string().optional(),
  partially_paid_url: z.string().optional(),
  underpaid_url: z.string().optional(),
  overpaid_url: z.string().optional(),
});

/** Params for `GET /v1/payment` (requires JWT). */
export const paymentListParamsSchema = z.strictObject({
  /** Records per page (1–500). */
  limit: z.number().int().min(1).max(500),
  /** Page number (0-indexed). */
  page: z.number().int().min(0),
  /** Filter by invoice ID. */
  invoiceId: z.string().optional(),
  sortBy: z
    .enum([
      "payment_id",
      "payment_status",
      "pay_address",
      "price_amount",
      "price_currency",
      "pay_amount",
      "actually_paid",
      "pay_currency",
      "order_id",
      "order_description",
      "purchase_id",
      "outcome_amount",
      "outcome_currency",
      "created_at",
    ])
    .optional(),
  orderBy: z.enum(["asc", "desc"]).optional(),
  /** `YYYY-MM-DD` or ISO 8601. */
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

/** Paginated response from `GET /v1/payment`. */
export const paymentListResponseSchema = z.looseObject({
  data: z.array(paymentSchema),
  limit: z.number(),
  page: z.number(),
  pagesCount: z.number(),
  total: z.number(),
});

/** Payload for `POST /v1/invoice`. */
export const invoiceCreatePayloadSchema = z.strictObject({
  price_amount: moneySchema,
  price_currency: fiatCurrencySchema,
  /** Omit to let the customer choose on the invoice page. */
  pay_currency: cryptoCurrencySchema.optional(),
  ipn_callback_url: z.string().url().optional(),
  order_id: z.string().optional(),
  order_description: z.string().optional(),
  success_url: z.string().url().optional(),
  cancel_url: z.string().url().optional(),
  is_fixed_rate: z.boolean().optional(),
  is_fee_paid_by_user: z.boolean().optional(),
});

/** An invoice (payment link) record. */
export const invoiceSchema = z.looseObject({
  id: z.number(),
  order_id: z.string(),
  order_description: z.string(),
  price_amount: moneySchema,
  price_currency: fiatCurrencySchema,
  pay_currency: cryptoCurrencySchema.nullable(),
  ipn_callback_url: z.string(),
  invoice_url: z.string(),
  success_url: z.string(),
  cancel_url: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

/** Balance for a single currency. */
export const accountBalanceSchema = z.looseObject({
  amount: moneySchema,
  pendingAmount: moneySchema,
});

/** Response from `GET /v1/balance` — keyed by currency ticker. */
export const accountBalanceResponseSchema = z.record(
  z.string(),
  accountBalanceSchema,
);

/** Payload for `POST /v1/payout/validate-address`. */
export const validateAddressPayloadSchema = z.strictObject({
  address: z.string().min(1),
  currency: cryptoCurrencySchema,
  /** Memo / tag, when applicable. */
  extra_id: z.string().nullable().optional(),
});

/** Response from `POST /v1/payout/validate-address`. */
export const validateAddressResponseSchema = z.looseObject({
  status: z.boolean(),
  statusCode: z.number().optional(),
  message: z.string().optional(),
});

export type PaymentStatusOutput = z.infer<typeof paymentStatusSchema>;
export type PaymentCreatePayloadInput = z.infer<
  typeof paymentCreatePayloadSchema
>;
export type PaymentOutput = z.infer<typeof paymentSchema>;
export type PaymentListParamsInput = z.infer<
  typeof paymentListParamsSchema
>;
export type PaymentListOutput = z.infer<typeof paymentListResponseSchema>;
export type InvoiceCreatePayloadInput = z.infer<
  typeof invoiceCreatePayloadSchema
>;
export type InvoiceOutput = z.infer<typeof invoiceSchema>;
export type AccountBalanceOutput = z.infer<
  typeof accountBalanceResponseSchema
>;
export type ValidateAddressPayloadInput = z.infer<
  typeof validateAddressPayloadSchema
>;
export type ValidateAddressOutput = z.infer<
  typeof validateAddressResponseSchema
>;
