
import { z } from "zod";

/**
 * Zod validation schemas for Conversion types.
 */

// Status validation
export const ConversionStatusSchema = z.enum([
  "WAITING",
  "PROCESSING",
  "FINISHED",
  "REJECTED",
]);

export type ConversionStatus = z.infer<typeof ConversionStatusSchema>;

// Money validation (assuming Money is a number)
export const MoneySchema = z.number();

// CreatePayload validation
export const ConversionCreatePayloadSchema = z.object({
  amount: MoneySchema,
  from_currency: z.string(),
  to_currency: z.string(),
});

// ListParams validation
export const ConversionListParamsSchema = z.object({
  id: z.union([z.number(), z.array(z.number())]).optional(),
  status: z
    .union([
      ConversionStatusSchema,
      z.array(ConversionStatusSchema),
    ])
    .optional(),
  from_currency: z.string().optional(),
  to_currency: z.string().optional(),
  created_at_from: z.string().datetime().optional(),
  created_at_to: z.string().datetime().optional(),
  limit: z.number().int().positive().default(10).optional(),
  offset: z.number().int().nonnegative().default(0).optional(),
  order: z.enum(["ASC", "DESC"]).optional(),
});

// Export schemas with consistent naming
export const conversionCreateScheme = ConversionCreatePayloadSchema;
export const conversionListParamScheme = ConversionListParamsSchema;