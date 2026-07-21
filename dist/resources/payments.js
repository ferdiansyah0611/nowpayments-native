import { Resource } from "./main.js";
/**
 * Payment endpoints.
 *
 * - `POST /v1/payment` — create a payment.
 * - `GET /v1/payment` — list payments.
 * - `GET /v1/payment/{id}` — get a single payment by id.
 * - `POST /v1/invoice` — create an invoice (payment link).
 * - `GET /v1/balance` — account balances.
 * - `POST /v1/payout/validate-address` — validate a payout address.
 */
export class PaymentsResource extends Resource {
    /**
     * Creates payment. With this method, your customer will be able to complete the payment without leaving your website.
     * Be sure to consider the details of repeated and wrong-asset deposits from 'Repeated Deposits and Wrong-Asset Deposits' section when processing payments.
     * @requires APIKey
    */
    create(payload, options) {
        return this.http.post("/v1/payment", payload, options);
    }
    /**
     * Returns the entire list of all transactions created with certain API key.
     * @requires JWT
     * @requires APIKey
     */
    list(params, options) {
        return this.http.get("/v1/payment", params, options);
    }
    /**
     * Get the actual information about the payment. You need to provide the ID of the payment in the request.
     * @requires APIKey
     */
    get(paymentId, options) {
        return this.http.get(`/v1/payment/${paymentId}`, undefined, options);
    }
    /**
     * Creates a payment link. With this method, the customer is required to follow the generated url to complete the payment. Data must be sent as a JSON-object payload.
     * @requires APIKey
     */
    createInvoice(payload, options) {
        return this.http.post("/v1/invoice", payload, options);
    }
    /**
     * This method returns your balance in different currencies.
     * @requires APIKey
     */
    balance(options) {
        return this.http.get("/v1/balance", undefined, options);
    }
    /**
     * This endpoint allows you to check if your payout address is valid and funds can be received there.
     * @requires APIKey
     */
    validateAddress(payload, options) {
        return this.http.post("/v1/payout/validate-address", payload, options);
    }
}
//# sourceMappingURL=payments.js.map