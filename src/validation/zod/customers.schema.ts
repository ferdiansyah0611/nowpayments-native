/**
 * Zod schemas for the customers resource (`client.customers`).
 *
 * Sub-partner (custody) management endpoints.
 *
 * - `customerBalanceResponseSchema`    — `GET /v1/sub-partner/balance/:id`
 * - `customerListParamsSchema`         — `GET /v1/sub-partner` (JWT)
 * - `customerCreatePayloadSchema`      — `POST /v1/sub-partner/balance` (JWT)
 * - `customerCreatePaymentPayloadSchema`— `POST /v1/sub-partner/payment` (JWT + API key)
 * - `customerListPaymentsParamsSchema` — `GET /v1/sub-partner/payments` (JWT)
 * - `customerDepositPayloadSchema`     — `POST /v1/sub-partner/deposit` (JWT + API key)
 * - `customerTransferPayloadSchema`    — `POST /v1/sub-partner/transfer` (JWT)
 * - `customerListTransfersParamsSchema`— `GET /v1/sub-partner/transfers` (JWT)
 * - `customerWriteOffPayloadSchema`    — `POST /v1/sub-partner/write-off` (JWT)
 */
import { z } from "zod";
import {
  cryptoCurrencySchema,
  currencyBalanceSchema,
  fiatCurrencySchema,
  moneySchema,
} from "./common.schema.js";
import { paymentStatusSchema } from "./payments.schema.js";

/** Transaction status for transfers. */
export const transactionStatusSchema = z.enum([
  "CREATED",
  "WAITING",
  "FINISHED",
  "REJECTED",
]);

/** Response from `GET /v1/sub-partner/balance/:id` (API key, whitelisted IP). */
export const customerBalanceResponseSchema = z.looseObject({
  result: z.looseObject({
    subPartnerId: z.string(),
    balances: z.record(z.string(), currencyBalanceSchema),
  }),
});

/** A single customer / sub-partner record. */
export const customerSchema = z.looseObject({
  id: z.string(),
  name: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

/** Params for `GET /v1/sub-partner`. */
export const customerListParamsSchema = z.strictObject({
  id: z.string().optional(),
  offset: z.number().int().min(0).optional(),
  limit: z.number().int().positive().optional(),
  order: z.enum(["ASC", "DESC"]).optional(),
});

/** Response from `GET /v1/sub-partner`. */
export const customerListResponseSchema = z.looseObject({
  result: z.array(customerSchema),
  count: z.number(),
});

/** Payload for `POST /v1/sub-partner/balance` — create a customer account. */
export const customerCreatePayloadSchema = z.strictObject({
  name: z.string().min(1),
});

/** Response from `POST /v1/sub-partner/balance`. */
export const customerCreateResponseSchema = z.looseObject({
  result: customerSchema,
});

/** Payment record for a customer (sub-partner). */
export const customerPaymentSchema = z.looseObject({
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
  parent_payment_id: z.number().nullable(),
  invoice_id: z.string().nullable(),
  payment_extra_ids: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

/** Payload for `POST /v1/sub-partner/payment`. */
export const customerCreatePaymentPayloadSchema = z.strictObject({
  currency: z.string().min(1),
  amount: z.number(),
  sub_partner_id: z.string().min(1),
  is_fixed_rate: z.boolean(),
  is_fee_paid_by_user: z.boolean(),
  ipn_callback_url: z.string().url(),
});

/** Response from `POST /v1/sub-partner/payment`. */
export const customerCreatePaymentResponseSchema = z.looseObject({
  result: customerPaymentSchema,
});

/** Params for `GET /v1/sub-partner/payments`. */
export const customerListPaymentsParamsSchema = z.strictObject({
  limit: z.number().int(),
  page: z.number().int().min(0).optional(),
  id: z.string().optional(),
  pay_currency: z.string().optional(),
  status: z.string().optional(),
  sub_partner_id: z.string().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  orderBy: z.enum(["asc", "desc"]).optional(),
  sortBy: z
    .enum(["id", "status", "pay_currency", "created_at", "updated_at"])
    .optional(),
});

/** Response from `GET /v1/sub-partner/payments`. */
export const customerPaymentsListResponseSchema = z.looseObject({
  result: z.array(customerPaymentSchema),
  count: z.number(),
});

/** Payload for `POST /v1/sub-partner/deposit` — top up a customer. */
export const customerDepositPayloadSchema = z.strictObject({
  currency: z.string().min(1),
  amount: z.number(),
  sub_partner_id: z.string().min(1),
});

/** Deposit record returned by `POST /v1/sub-partner/deposit`. */
export const customerDepositSchema = z.looseObject({
  payment_id: z.string(),
  payment_status: paymentStatusSchema,
  pay_address: z.string(),
  price_amount: z.number(),
  price_currency: z.string(),
  pay_amount: z.number(),
  amount_received: z.number(),
  pay_currency: z.string(),
  order_id: z.string().nullable(),
  order_description: z.string().nullable(),
  ipn_callback_url: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  purchase_id: z.string(),
  smart_contract: z.unknown().optional(),
  network: z.string(),
  network_precision: z.unknown().optional(),
  time_limit: z.unknown().optional(),
  burning_percent: z.unknown().optional(),
  expiration_estimate_date: z.string(),
  is_fixed_rate: z.boolean(),
  is_fee_paid_by_user: z.boolean(),
  valid_until: z.string(),
  type: z.string(),
});

/** Response from `POST /v1/sub-partner/deposit`. */
export const customerCreateDepositResponseSchema = z.looseObject({
  result: customerDepositSchema,
});

/** Payload for `POST /v1/sub-partner/transfer` — transfer between customers. */
export const customerTransferPayloadSchema = z.strictObject({
  from_id: z.string().min(1),
  to_id: z.string().min(1),
  amount: z.string().min(1),
  currency: z.string().min(1),
});

/** A single transfer record. */
export const customerTransferSchema = z.looseObject({
  id: z.string(),
  from_sub_id: z.string(),
  to_sub_id: z.string(),
  status: transactionStatusSchema,
  created_at: z.string(),
  updated_at: z.string(),
  amount: z.string(),
  currency: z.string(),
});

/** Response from `POST /v1/sub-partner/transfer` and `POST /v1/sub-partner/write-off`. */
export const customerWriteOffCreateResponseSchema = z.looseObject({
  result: z.looseObject({
    id: z.string(),
    from_sub_id: z.string(),
    to_sub_id: z.string(),
    status: transactionStatusSchema,
    amount: z.string(),
    currency: z.string(),
    destination: z.string(),
    type: z.string(),
    created_at: z.string(),
    updated_at: z.string(),
  }),
});

/** Params for `GET /v1/sub-partner/transfers`. */
export const customerListTransfersParamsSchema = z.strictObject({
  id: z.union([z.number(), z.array(z.number().int())]).optional(),
  status: transactionStatusSchema,
  limit: z.number().int(),
  offset: z.number().int(),
  order: z.enum(["ASC", "DESC"]).optional(),
});

/** Response from `GET /v1/sub-partner/transfers`. */
export const customerTransferListResponseSchema = z.looseObject({
  result: z.array(customerTransferSchema),
  count: z.number(),
});

/** Response from `GET /v1/sub-partner/transfer/:id`. */
export const customerTransferResponseSchema = z.looseObject({
  result: customerTransferSchema,
});

/** Payload for `POST /v1/sub-partner/write-off` — withdraw to master account. */
export const customerWriteOffPayloadSchema = z.strictObject({
  currency: z.string().min(1),
  amount: z.number(),
  sub_partner_id: z.string().min(1),
});

export type TransactionStatusOutput = z.infer<
  typeof transactionStatusSchema
>;
export type CustomerBalanceOutput = z.infer<
  typeof customerBalanceResponseSchema
>;
export type CustomerOutput = z.infer<typeof customerSchema>;
export type CustomerListParamsInput = z.infer<
  typeof customerListParamsSchema
>;
export type CustomerListOutput = z.infer<
  typeof customerListResponseSchema
>;
export type CustomerCreatePayloadInput = z.infer<
  typeof customerCreatePayloadSchema
>;
export type CustomerCreatePaymentPayloadInput = z.infer<
  typeof customerCreatePaymentPayloadSchema
>;
export type CustomerCreatePaymentOutput = z.infer<
  typeof customerCreatePaymentResponseSchema
>;
export type CustomerPaymentOutput = z.infer<
  typeof customerPaymentSchema
>;
export type CustomerListPaymentsParamsInput = z.infer<
  typeof customerListPaymentsParamsSchema
>;
export type CustomerPaymentsListOutput = z.infer<
  typeof customerPaymentsListResponseSchema
>;
export type CustomerDepositPayloadInput = z.infer<
  typeof customerDepositPayloadSchema
>;
export type CustomerDepositOutput = z.infer<
  typeof customerDepositSchema
>;
export type CustomerCreateDepositOutput = z.infer<
  typeof customerCreateDepositResponseSchema
>;
export type CustomerTransferPayloadInput = z.infer<
  typeof customerTransferPayloadSchema
>;
export type CustomerTransferOutput = z.infer<
  typeof customerTransferSchema
>;
export type CustomerWriteOffCreateOutput = z.infer<
  typeof customerWriteOffCreateResponseSchema
>;
export type CustomerListTransfersParamsInput = z.infer<
  typeof customerListTransfersParamsSchema
>;
export type CustomerTransferListOutput = z.infer<
  typeof customerTransferListResponseSchema
>;
export type CustomerWriteOffPayloadInput = z.infer<
  typeof customerWriteOffPayloadSchema
>;
