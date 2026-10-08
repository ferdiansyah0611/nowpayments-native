/**
 * Zod schemas for the payouts resource (`client.payouts`).
 *
 * - `payoutCreatePayloadSchema`         — `POST /v1/payout` (JWT + API key)
 * - `payoutListParamsSchema`            — `GET /v1/payout`
 * - `verifyBatchWithdrawalPayloadSchema`— `POST /v1/payout/:id/verify`
 * - `payoutFeeParamsSchema`             — `GET /v1/payout/fee`
 *
 * Payouts only work from whitelisted IPs to whitelisted addresses.
 */
import { z } from "zod";
import { moneySchema } from "./common.schema.js";

/** Withdrawal status inside a payout batch. */
export const withdrawalStatusSchema = z.enum([
  "CREATING",
  "WAITING",
  "PROCESSING",
  "SENDING",
  "FINISHED",
  "FAILED",
  "REJECTED",
]);

/** A single withdrawal inside a payout batch response. */
export const withdrawalSchema = z.looseObject({
  id: z.string(),
  address: z.string(),
  currency: z.string(),
  amount: moneySchema,
  ipn_callback_url: z.string(),
  batch_withdrawal_id: z.string(),
  status: withdrawalStatusSchema,
  error: z.unknown().optional(),
  extra_id: z.unknown().optional(),
  hash: z.unknown().optional(),
  payout_description: z.unknown().optional(),
  unique_external_id: z.unknown().optional(),
  requested_at: z.null().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  update_history_log: z.unknown().optional(),
  rejected_check_attempts: z.number(),
  fee: z.number().nullable(),
  fee_paid_by: z.string().nullable(),
  is_request_payouts: z.boolean(),
});

/** Payload for `POST /v1/payout`. */
export const payoutCreatePayloadSchema = z.strictObject({
  ipn_callback_url: z.string().url().optional(),
  withdrawals: z
    .array(
      z.strictObject({
        address: z.string().min(1),
        currency: z.string().min(1),
        amount: moneySchema,
        fiat_amount: z.number().optional(),
        fiat_currency: z.string().optional(),
        ipn_callback_url: z.string().url().optional(),
      }),
    )
    .min(1),
});

/** Response from `POST /v1/payout`. */
export const payoutCreateResponseSchema = z.looseObject({
  id: z.string(),
  withdrawals: z.array(withdrawalSchema),
});

/** A payout (withdrawal) record. */
export const payoutSchema = z.looseObject({
  id: z.number(),
  amount: moneySchema,
  currency: z.string(),
  address: z.string(),
  status: z.enum([
    "CREATED",
    "PROCESSING",
    "DONE",
    "FAILED",
    "WAITING_FOR_CONFIRMATION",
  ]),
  txHash: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  batch: z.boolean().optional(),
  fee: moneySchema.optional(),
});

/** Params for `GET /v1/payout`. */
export const payoutListParamsSchema = z.strictObject({
  batch_id: z.string().optional(),
  status: z.string().optional(),
  order_by: z
    .enum([
      "id",
      "batchId",
      "dateCreated",
      "dateRequested",
      "dateUpdated",
      "currency",
      "status",
    ])
    .optional(),
  order: z.enum(["asc", "desc"]).optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  limit: z.number().int().positive().optional(),
  page: z.number().int().min(0).optional(),
});

/** Paginated response from `GET /v1/payout`. */
export const payoutListResponseSchema = z.looseObject({
  data: z.array(payoutSchema),
  limit: z.number(),
  page: z.number(),
  pagesCount: z.number(),
  total: z.number(),
});

/** Payload for `POST /v1/payout/:batch-withdrawal-id/verify`. */
export const verifyBatchWithdrawalPayloadSchema = z.strictObject({
  /** 2FA code from Google Auth app or email. */
  verification_code: z.string().min(1),
});

/** Response from `POST /v1/payout/:batch-withdrawal-id/verify`. */
export const verifyBatchWithdrawalResponseSchema = z.looseObject({
  result: z.string(),
});

/** Response from `GET /v1/payout-withdrawal/min-amount/:coin`. */
export const minWithdrawalAmountResponseSchema = z.looseObject({
  success: z.boolean(),
  result: z.number(),
});

/** Params for `GET /v1/payout/fee`. */
export const payoutFeeParamsSchema = z.strictObject({
  currency: z.string().min(1),
  amount: z.number(),
});

/** Response from `GET /v1/payout/fee`. */
export const payoutFeeResponseSchema = z.looseObject({
  currency: z.string(),
  fee: z.number(),
});

export type WithdrawalStatusOutput = z.infer<
  typeof withdrawalStatusSchema
>;
export type WithdrawalOutput = z.infer<typeof withdrawalSchema>;
export type PayoutCreatePayloadInput = z.infer<
  typeof payoutCreatePayloadSchema
>;
export type PayoutCreateOutput = z.infer<
  typeof payoutCreateResponseSchema
>;
export type PayoutOutput = z.infer<typeof payoutSchema>;
export type PayoutListParamsInput = z.infer<
  typeof payoutListParamsSchema
>;
export type PayoutListOutput = z.infer<typeof payoutListResponseSchema>;
export type VerifyBatchWithdrawalPayloadInput = z.infer<
  typeof verifyBatchWithdrawalPayloadSchema
>;
export type VerifyBatchWithdrawalOutput = z.infer<
  typeof verifyBatchWithdrawalResponseSchema
>;
export type MinWithdrawalAmountOutput = z.infer<
  typeof minWithdrawalAmountResponseSchema
>;
export type PayoutFeeParamsInput = z.infer<
  typeof payoutFeeParamsSchema
>;
export type PayoutFeeOutput = z.infer<typeof payoutFeeResponseSchema>;
