import type { RequestOptions } from "../http.js";
import type { Subscription } from "../types/subscriptions.types.js";
import { Resource } from "./main.js";
/**
 * Email subscriptions (recurring payments) endpoints.
 *
 * - `POST v1/subscriptions` — create a subscription (API KEY & JWT).
 * - `GET v1/subscriptions` — list subscriptions (JWT).
 * - `PUT v1/subscriptions/:id` — update a subscription (JWT).
 * - `POST v1/subscriptions/:id/cancel` — cancel a subscription (JWT).
 *
 * Subscription plans (recurring payment plans) endpoints.
 *
 * - `POST v1/subscriptions/plans` — create a plan (JWT).
 * - `GET v1/subscriptions/plans/:id` — get a plan (API key).
 * - `GET v1/subscriptions/plans` — list plans (API key).
 * - `PATCH v1/subscriptions/plans/:id` — update a plan (JWT).
 */
export declare class SubscriptionResource extends Resource {
    /**
     * This is the method to create a Recurring Payments plan. Every plan has its unique ID which is required for generating separate payments.
     * @requires JWT
     */
    createPlan(payload: Subscription.CreatePlanPayload, options?: RequestOptions): Promise<Subscription.PlanResponse>;
    /**
     * This method allows you to obtain information about your payment plan (you need to specify your payment plan id in the request).
     * @requires APIKey
     */
    getPlan(id: string, options?: RequestOptions): Promise<Subscription.PlanResponse>;
    /**
     * This method allows you to obtain information about all the payment plans you’ve created.
     * @requires APIKey
     */
    getAllPlans(params?: Subscription.ListPlansParams, options?: RequestOptions): Promise<Subscription.PlanListResponse>;
    /**
     * This method allows you to add necessary changes to a created plan.
     * They won’t affect users who have already paid; however, the changes will take effect when a new payment is to be made.
     * @requires JWT
     */
    updatePlan(id: string, payload: Subscription.UpdatePlanPayload, options?: RequestOptions): Promise<Subscription.PlanResponse>;
    /**
     * This method allows you to send payment links to your customers via email.
     * A day before the paid period ends, the customer receives a new letter with a new payment link.
     * @requires JWT
     * @requires APIKey
     */
    createPayment(payload: Subscription.CreatePayload, options?: RequestOptions): Promise<Subscription.Response>;
    /**
     * The method allows you to view the entire list of recurring payments filtered by payment status and/or payment plan id
     * @requires APIKey
     */
    listPayments(params?: Subscription.ListParams, options?: RequestOptions): Promise<Subscription.ListResponse>;
    /**
     * Get information about a particular recurring payment via its ID.
     * @requires APIKey
     */
    getPayment(id: string, options?: RequestOptions): Promise<Subscription.Response>;
    /**
     * Completely removes a particular payment from the recurring payment plan.
     * You need to specify the payment plan id in the request.
     * @requires JWT
     */
    cancelPayment(id: string, options?: RequestOptions): Promise<Subscription.Response>;
}
//# sourceMappingURL=subscriptions.d.ts.map