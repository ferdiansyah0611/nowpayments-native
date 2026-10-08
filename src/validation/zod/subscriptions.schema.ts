/**
 * Zod schemas for the subscriptions resource (`client.subscriptions`).
 *
 * - Subscription plans: `createPlan`, `getPlan`, `getAllPlans`, `updatePlan`
 * - Email subscriptions (recurring payments): `createPayment`,
 *   `listPayments`, `getPayment`, `cancelPayment`
 */
import { z } from "zod";
import { fiatCurrencySchema } from "./common.schema.js";
import { paymentStatusSchema } from "./payments.schema.js";

/** Billing interval for an email subscription. */
export const subscriptionIntervalSchema = z.enum([
  "daily",
  "weekly",
  "monthly",
  "yearly",
]);

/** Status of a subscription payment. */
export const subscriptionPaymentStatusSchema = z.enum([
  "WAITING_PAY",
  "PAID",
  "PARTIALLY_PAID",
  "EXPIRED",
]);

/** A single subscription plan record. */
export const subscriptionPlanSchema = z.looseObject({
  id: z.string(),
  title: z.string(),
  /** Recurring duration in days (returned as string). */
  interval_day: z.string(),
  ipn_callback_url: z.string().nullable().optional(),
  success_url: z.string().nullable().optional(),
  cancel_url: z.string().nullable().optional(),
  partially_paid_url: z.string().nullable().optional(),
  /** Amount charged in fiat. */
  amount: z.number(),
  currency: fiatCurrencySchema,
  created_at: z.string(),
  updated_at: z.string(),
});

/** Payload for `POST v1/subscriptions/plans` (JWT). */
export const subscriptionCreatePlanPayloadSchema = z.strictObject({
  title: z.string().min(1),
  /** Recurring duration in days. */
  interval_day: z.number().int().positive(),
  /** Amount charged in fiat. */
  amount: z.number(),
  currency: fiatCurrencySchema,
  ipn_callback_url: z.string().url().optional(),
  success_url: z.string().url().optional(),
  cancel_url: z.string().url().optional(),
  partially_paid_url: z.string().url().optional(),
});

/** Response wrapper — `{ result: Plan }`. */
export const subscriptionPlanResponseSchema = z.looseObject({
  result: subscriptionPlanSchema,
});

/** Params for `GET v1/subscriptions/plans`. */
export const subscriptionListPlansParamsSchema = z.strictObject({
  limit: z.number().int().positive().optional(),
  offset: z.number().int().min(0).optional(),
});

/** Response wrapper — `{ result: Plan[], count }`. */
export const subscriptionPlanListResponseSchema = z.looseObject({
  result: z.array(subscriptionPlanSchema),
  count: z.number().optional(),
});

/** Payload for `PATCH v1/subscriptions/plans/:id` (JWT) — all fields optional. */
export const subscriptionUpdatePlanPayloadSchema = z.strictObject({
  title: z.string().min(1).optional(),
  interval_day: z.number().int().positive().optional(),
  amount: z.number().optional(),
  currency: fiatCurrencySchema.optional(),
  ipn_callback_url: z.string().url().optional(),
  success_url: z.string().url().optional(),
  cancel_url: z.string().url().optional(),
  partially_paid_url: z.string().url().optional(),
});

/** An email subscription (recurring payment) record. */
export const emailSubscriptionSchema = z.looseObject({
  id: z.string(),
  subscription_plan_id: z.union([z.string(), z.number()]),
  is_active: z.boolean(),
  subscriber: z.looseObject({
    email: z.string().optional(),
    sub_partner_id: z.string().optional(),
  }),
  expire_date: z.string(),
  status: paymentStatusSchema,
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

/** Payload for `POST v1/subscriptions` (JWT + API key). */
export const subscriptionCreatePayloadSchema = z.strictObject({
  /** ID of the payment plan. */
  subscription_plan_id: z.union([z.string(), z.number()]),
  /** Customer email to send payment links to. */
  email: z.string().email(),
  /** Customer (sub-partner) id. */
  sub_partner_id: z.number().optional(),
});

/** Response wrapper — `{ result: EmailSubscription }`. */
export const subscriptionResponseSchema = z.looseObject({
  result: emailSubscriptionSchema,
});

/** Params for `GET v1/subscriptions`. */
export const subscriptionListParamsSchema = z.strictObject({
  limit: z.number().int().positive().optional(),
  offset: z.number().int().min(0).optional(),
  status: subscriptionPaymentStatusSchema.optional(),
  subscription_plan_id: z.union([z.string(), z.number()]).optional(),
  is_active: z.boolean().optional(),
});

/** Response wrapper — `{ result: EmailSubscription[], count }`. */
export const subscriptionListResponseSchema = z.looseObject({
  result: z.array(emailSubscriptionSchema),
  count: z.number().optional(),
});

export type SubscriptionIntervalOutput = z.infer<
  typeof subscriptionIntervalSchema
>;
export type SubscriptionPaymentStatusOutput = z.infer<
  typeof subscriptionPaymentStatusSchema
>;
export type SubscriptionPlanOutput = z.infer<
  typeof subscriptionPlanSchema
>;
export type SubscriptionCreatePlanPayloadInput = z.infer<
  typeof subscriptionCreatePlanPayloadSchema
>;
export type SubscriptionPlanResponseOutput = z.infer<
  typeof subscriptionPlanResponseSchema
>;
export type SubscriptionListPlansParamsInput = z.infer<
  typeof subscriptionListPlansParamsSchema
>;
export type SubscriptionPlanListOutput = z.infer<
  typeof subscriptionPlanListResponseSchema
>;
export type SubscriptionUpdatePlanPayloadInput = z.infer<
  typeof subscriptionUpdatePlanPayloadSchema
>;
export type EmailSubscriptionOutput = z.infer<
  typeof emailSubscriptionSchema
>;
export type SubscriptionCreatePayloadInput = z.infer<
  typeof subscriptionCreatePayloadSchema
>;
export type SubscriptionResponseOutput = z.infer<
  typeof subscriptionResponseSchema
>;
export type SubscriptionListParamsInput = z.infer<
  typeof subscriptionListParamsSchema
>;
export type SubscriptionListOutput = z.infer<
  typeof subscriptionListResponseSchema
>;
