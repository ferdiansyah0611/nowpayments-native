/**
 * Email subscriptions (recurring payments) types for the NowPayments API.
 */
import type { FiatCurrency, Money, CryptoCurrency } from "./main.types.js";
export declare namespace Subscription {
    /** Billing interval for an email subscription. */
    type Interval = "daily" | "weekly" | "monthly" | "yearly";
    /** Lifecycle status of an email subscription. */
    type Status = "CREATED" | "ACTIVE" | "UPDATED" | "CANCELLED" | "FAILED";
    /** A single email subscription record. */
    interface EmailSubscription {
        /** Subscription id. */
        id: string;
        /** ID of the payment plan. */
        subscription_plan_id: string | number;
        /** Whether the subscription is currently active. */
        is_active: boolean;
        subscriber: {
            email?: string;
            sub_partner_id?: string;
        };
        /** Expiration date of the subscription. */
        expire_date: string;
        /** Subscription status. */
        status: PaymentStatus;
        /** ISO 8601 creation timestamp. */
        created_at?: string;
        /** ISO 8601 last-update timestamp. */
        updated_at?: string;
    }
    /** Response wrapper for subscription endpoints (`{ result: {...} }`). */
    interface Response {
        result: EmailSubscription;
    }
    /** Response wrapper for the list endpoint (`{ result: [...] }`). */
    interface ListResponse {
        result: EmailSubscription[];
        /** Total number of subscriptions matching the query. */
        count?: number;
    }
    /** Payload to update an email subscription (`PUT /v1/sub-partner/email-subscription/:id`). */
    interface UpdatePayload {
        /** New amount charged every interval. */
        amount?: Money;
        /** New currency ticker. */
        currency?: CryptoCurrency;
        /** New billing interval. */
        interval?: Interval;
    }
    /** Status of a subscription payment. */
    type PaymentStatus = "WAITING_PAY" | "PAID" | "PARTIALLY_PAID" | "EXPIRED";
    /** Subscriber information for a subscription. */
    interface Subscriber {
        /** Email of the subscriber. */
        email?: string;
        /** Sub-partner ID of the subscriber. */
        sub_partner_id?: string;
    }
    /** Payload to create a new subscription (`POST v1/subscriptions`). */
    interface CreatePayload {
        /** ID of the payment plan. */
        subscription_plan_id: string | number;
        /** Customer email to send payment links to. */
        email: string;
        /** Customer id */
        sub_partner_id?: number;
    }
    /** Parameters for listing subscriptions. */
    interface ListParams {
        /** Maximum number of records to return. */
        limit?: number;
        /** Page number (0-indexed). */
        offset?: number;
        /** Filter by subscription status. */
        status?: PaymentStatus;
        /** Filter by subscription plan ID. */
        subscription_plan_id?: string | number;
        /** Filter by active status. */
        is_active?: boolean;
    }
    /** A single subscription plan record. */
    interface Plan {
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
    interface CreatePlanPayload {
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
    interface UpdatePlanPayload {
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
    interface PlanResponse {
        result: Plan;
    }
    /** Response wrapper for the list plans endpoint (`{ result: [...] }`). */
    interface PlanListResponse {
        result: Plan[];
        /** Total number of plans matching the query. */
        count?: number;
    }
    /** Parameters for listing subscription plans. */
    interface ListPlansParams {
        /** Maximum number of records to return. */
        limit?: number;
        /** Page number (0-indexed). */
        offset?: number;
    }
}
//# sourceMappingURL=subscriptions.types.d.ts.map