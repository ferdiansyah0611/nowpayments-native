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
export class SubscriptionResource extends Resource {
    /**
     * This is the method to create a Recurring Payments plan. Every plan has its unique ID which is required for generating separate payments.
     * @requires JWT
     */
    createPlan(payload, options) {
        return this.http.post("v1/subscriptions/plans", payload, options);
    }
    /**
     * This method allows you to obtain information about your payment plan (you need to specify your payment plan id in the request).
     * @requires APIKey
     */
    getPlan(id, options) {
        return this.http.get(`v1/subscriptions/plans/${id}`, undefined, options);
    }
    /**
     * This method allows you to obtain information about all the payment plans you’ve created.
     * @requires APIKey
     */
    getAllPlans(params, options) {
        return this.http.get("v1/subscriptions/plans", params, options);
    }
    /**
     * This method allows you to add necessary changes to a created plan.
     * They won’t affect users who have already paid; however, the changes will take effect when a new payment is to be made.
     * @requires JWT
     */
    updatePlan(id, payload, options) {
        return this.http.patch(`v1/subscriptions/plans/${id}`, payload, options);
    }
    /**
     * This method allows you to send payment links to your customers via email.
     * A day before the paid period ends, the customer receives a new letter with a new payment link.
     * @requires JWT
     * @requires APIKey
     */
    createPayment(payload, options) {
        return this.http.post("v1/subscriptions", payload, options);
    }
    /**
     * The method allows you to view the entire list of recurring payments filtered by payment status and/or payment plan id
     * @requires APIKey
     */
    listPayments(params, options) {
        return this.http.get("v1/subscriptions", params, options);
    }
    /**
     * Get information about a particular recurring payment via its ID.
     * @requires APIKey
     */
    getPayment(id, options) {
        return this.http.get(`v1/subscriptions/${id}`, undefined, options);
    }
    /**
     * Completely removes a particular payment from the recurring payment plan.
     * You need to specify the payment plan id in the request.
     * @requires JWT
     */
    cancelPayment(id, options) {
        return this.http.delete(`v1/subscriptions/${id}`, undefined, options);
    }
}
//# sourceMappingURL=subscriptions.js.map