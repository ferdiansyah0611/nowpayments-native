/**
 * Email subscriptions (recurring payments) types for the NowPayments API.
 */

import type { FiatCurrency, Money, CryptoCurrency } from "./main.js";

/** Billing interval for an email subscription. */
export type SubscriptionInterval = "daily" | "weekly" | "monthly" | "yearly";

/** Lifecycle status of an email subscription. */
export type SubscriptionStatus = "CREATED" | "ACTIVE" | "UPDATED" | "CANCELLED" | "FAILED";

/** A single email subscription record. */
export interface EmailSubscription {
  /** Subscription id. */
  id: string;
  /** ID of the payment plan. */
  subscription_plan_id: string | number;
  /** Whether the subscription is currently active. */
  is_active: boolean;
  subscriber: {
    /** Customer email charged by the subscription. */
    email: string;
  };
  /** Expiration date of the subscription. */
  expire_date: string;
  /** Subscription status. */
  status: SubscriptionPaymentStatus;
  /** ISO 8601 creation timestamp. */
  created_at?: string;
  /** ISO 8601 last-update timestamp. */
  updated_at?: string;
}

/** Response wrapper for subscription endpoints (`{ result: {...} }`). */
export interface SubscriptionResponse {
  result: EmailSubscription;
}

/** Response wrapper for the list endpoint (`{ result: [...] }`). */
export interface SubscriptionListResponse {
  result: EmailSubscription[];
  /** Total number of subscriptions matching the query. */
  count?: number;
}

/** Payload to update an email subscription (`PUT /v1/sub-partner/email-subscription/:id`). */
export interface UpdateSubscriptionPayload {
  /** New amount charged every interval. */
  amount?: Money;
  /** New currency ticker. */
  currency?: CryptoCurrency;
  /** New billing interval. */
  interval?: SubscriptionInterval;
}

/** A single subscription plan record. */
export interface SubscriptionPlan {
  /** Plan id. */
  id: string;
  /** Name of the recurring payments plan. */
  title: string;
  /** Recurring payments duration in days. */
  interval_day: string;
  /** IPN callback URL. */
  ipn_callback_url?: string | null;
  /** URL user gets redirected to in case payment is successful. */
  success_url?: string | null;
  /** URL user gets redirected to in case payment is cancelled. */
  cancel_url?: string | null;
  /** URL user gets redirected to in case payment is underpaid. */
  partially_paid_url?: string | null;
  /** Amount of funds paid in fiat. */
  amount: number;
  /** Fiat currency ticker used for price. */
  currency: FiatCurrency;
  /** ISO 8601 creation timestamp. */
  created_at: string;
  /** ISO 8601 last-update timestamp. */
  updated_at: string;
}

/** Payload to create a new subscription plan (`POST v1/subscriptions/plans`). */
export interface CreatePlanPayload {
  /** Name of the recurring payments plan. */
  title: string;
  /** Recurring payments duration in days. */
  interval_day: number;
  /** Amount of funds paid in fiat. */
  amount: number;
  /** Fiat currency ticker used for price. */
  currency: FiatCurrency;
  /** IPN callback URL. */
  ipn_callback_url?: string;
  /** URL user gets redirected to in case payment is successful. */
  success_url?: string;
  /** URL user gets redirected to in case payment is cancelled. */
  cancel_url?: string;
  /** URL user gets redirected to in case payment is underpaid. */
  partially_paid_url?: string;
}

/** Payload to update a subscription plan (`PATCH v1/subscriptions/plans/:plan-id`). */
export interface UpdatePlanPayload {
  /** Name of the recurring payments plan. */
  title?: string;
  /** Recurring payments duration in days. */
  interval_day?: number;
  /** Amount of funds paid in fiat. */
  amount?: number;
  /** Fiat currency ticker used for price. */
  currency?: FiatCurrency;
  /** IPN callback URL. */
  ipn_callback_url?: string;
  /** URL user gets redirected to in case payment is successful. */
  success_url?: string;
  /** URL user gets redirected to in case payment is cancelled. */
  cancel_url?: string;
  /** URL user gets redirected to in case payment is underpaid. */
  partially_paid_url?: string;
}

/** Response wrapper for subscription plan endpoints (`{ result: {...} }`). */
export interface SubscriptionPlanResponse {
  result: SubscriptionPlan;
}

/** Response wrapper for the list plans endpoint (`{ result: [...] }`). */
export interface SubscriptionPlanListResponse {
  result: SubscriptionPlan[];
  /** Total number of plans matching the query. */
  count?: number;
}

/** Parameters for listing subscription plans. */
export interface ListPlansParams {
  /** Maximum number of records to return. */
  limit?: number;
  /** Page number (0-indexed). */
  offset?: number;
}

/** Status of a subscription payment. */
export type SubscriptionPaymentStatus =
  | "WAITING_PAY"
  | "PAID"
  | "PARTIALLY_PAID"
  | "EXPIRED";

/** Subscriber information for a subscription. */
export interface SubscriptionSubscriber {
  /** Email of the subscriber. */
  email?: string;
  /** Sub-partner ID of the subscriber. */
  sub_partner_id?: string;
}

/** A single subscription record (recurring payment). */
export interface Subscription {
  /** Subscription id. */
  id: string;
  /** ID of the payment plan. */
  subscription_plan_id: string | number;
  /** Whether the subscription is active. */
  is_active: boolean;
  /** Current payment status. */
  status: SubscriptionPaymentStatus;
  /** Expiration date of the subscription. */
  expire_date: string;
  /** Subscriber information. */
  subscriber: SubscriptionSubscriber;
  /** ISO 8601 creation timestamp. */
  created_at: string;
  /** ISO 8601 last-update timestamp. */
  updated_at: string;
}

/** Payload to create a new subscription (`POST v1/subscriptions`). */
export interface CreateSubscriptionPayload {
  /** ID of the payment plan. */
  subscription_plan_id: string | number;
  /** Customer email to send payment links to. */
  email: string;
}

/** Parameters for listing subscriptions. */
export interface ListSubscriptionsParams {
  /** Maximum number of records to return. */
  limit?: number;
  /** Page number (0-indexed). */
  offset?: number;
  /** Filter by subscription status. */
  status?: SubscriptionPaymentStatus;
  /** Filter by subscription plan ID. */
  subscription_plan_id?: string | number;
  /** Filter by active status. */
  is_active?: boolean;
}