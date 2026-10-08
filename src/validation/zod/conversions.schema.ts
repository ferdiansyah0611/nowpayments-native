/**
 * Zod schemas for the conversions resource (`client.conversions`).
 *
 * All endpoints require a JWT (`client.withJwt(token)`).
 *
 * - `conversionCreatePayloadSchema`  — `POST v1/conversion`
 * - `conversionResponseSchema`       — single conversion wrapper
 * - `conversionListParamsSchema`     — `GET v1/conversion`
 * - `conversionListResponseSchema`   — list wrapper
 */
import { z } from "zod";
import { moneySchema } from "./common.schema.js";

/** Conversion status. */
export const conversionStatusSchema = z.enum([
  "WAITING",
  "PROCESSING",
  "FINISHED",
  "REJECTED",
]);

/** A single conversion record. */
export const conversionSchema = z.looseObject({
  id: z.string(),
  status: conversionStatusSchema,
  from_currency: z.string(),
  to_currency: z.string(),
  from_amount: moneySchema,
  to_amount: moneySchema.nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

/** Payload for `POST v1/conversion`. */
export const conversionCreatePayloadSchema = z.strictObject({
  /** Amount to convert. */
  amount: moneySchema,
  /** Currency to convert from. */
  from_currency: z.string().min(1),
  /** Currency to convert to. */
  to_currency: z.string().min(1),
});

/** Response wrapper — `{ result: Conversion }`. */
export const conversionResponseSchema = z.looseObject({
  result: conversionSchema,
});

/** Params for `GET v1/conversion`. */
export const conversionListParamsSchema = z.strictObject({
  id: z.union([z.number(), z.array(z.number().int())]).optional(),
  status: z
    .union([conversionStatusSchema, z.array(conversionStatusSchema)])
    .optional(),
  from_currency: z.string().optional(),
  to_currency: z.string().optional(),
  created_at_from: z.string().optional(),
  created_at_to: z.string().optional(),
  limit: z.number().int().positive().optional(),
  offset: z.number().int().min(0).optional(),
  order: z.enum(["ASC", "DESC"]).optional(),
});

/** Response wrapper — `{ result: Conversion[], count }`. */
export const conversionListResponseSchema = z.looseObject({
  result: z.array(conversionSchema),
  count: z.number(),
});

export type ConversionStatusOutput = z.infer<typeof conversionStatusSchema>;
export type ConversionOutput = z.infer<typeof conversionSchema>;
export type ConversionCreatePayloadInput = z.infer<
  typeof conversionCreatePayloadSchema
>;
export type ConversionResponseOutput = z.infer<
  typeof conversionResponseSchema
>;
export type ConversionListParamsInput = z.infer<
  typeof conversionListParamsSchema
>;
export type ConversionListOutput = z.infer<
  typeof conversionListResponseSchema
>;
