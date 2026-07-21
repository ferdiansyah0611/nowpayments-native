import { Resource } from "./main.js";
/**
 * Customer management (sub-partner) endpoints.
 *
 * - `GET /v1/sub-partner/balance/:id` — get a customer's balance (API key).
 * - `GET /v1/sub-partner` — list customers (JWT).
 * - `POST /v1/sub-partner/balance` — create a customer account (JWT).
 * - `POST /v1/sub-partner/payment` — create a payment for a customer (JWT).
 * - `GET /v1/sub-partner/payments` — list payments for a customer (JWT).
 * - `POST /v1/sub-partner/deposit` — deposit funds to a customer (JWT).
 * - `POST /v1/sub-partner/transfer` — transfer funds between customers (JWT).
 * - `GET /v1/sub-partner/transfers` — list transfers (JWT).
 * - `GET /v1/sub-partner/transfer/:id` — get a single transfer (JWT).
 * - `POST /v1/sub-partner/write-off` — write off funds from a customer (JWT).
 */
export class CustomerResource extends Resource {
    /**
     * This request can be made only from a whitelisted IP.
     * If IP whitelisting is disabled, this request can be made by any user that has an API key.
     * @requires APIKey
     */
    balance(customerId, options) {
        return this.http.get(`/v1/sub-partner/balance/${customerId}`, undefined, options);
    }
    /**
     * This method returns the entire list of your customers.
     * @requires JWT
     */
    list(params, options) {
        return this.http.get("/v1/sub-partner", params, options);
    }
    /**
     * This is a method to create an account for your customer.
     * After this you'll be able to generate a payment(/v1/sub-partner/payment) or deposit(/v1/sub-partner/deposit)
     * for topping up its balance as well as withdraw funds from it.
     * @requires JWT
     */
    create(payload, options) {
        return this.http.post("/v1/sub-partner/balance", payload, options);
    }
    /**
     * This method allows you to top up a customer account with a general payment.
     * You can check the actual payment status by using GET 9 Get payment status request.
     * @requires JWT
     * @requires APIKey
     */
    createPayment(payload, options) {
        return this.http.post("/v1/sub-partner/payment", payload, options);
    }
    /**
     * This method allows you to get the list of all payments generated for a particular customer.
     * @requires JWT
     */
    listPayments(params, options) {
        return this.http.get("/v1/sub-partner/payments", params, options);
    }
    /**
     * This method allows you to top up a customer account with a general payment.
     * You can check the actual payment status by using GET 9 Get payment status request.
     * @requires JWT
     * @requires APIKey
     */
    createDeposits(payload, options) {
        return this.http.post("/v1/sub-partner/deposit", payload, options);
    }
    /**
     * This method allows creating transfers between users' accounts.
     * You can check the transfer's status using Get transfer method.
     * @requires JWT
     */
    createTransfers(params, options) {
        return this.http.post("/v1/sub-partner/transfer", params, options);
    }
    /**
     * Returns the entire list of transfers created by your customers.
     * @requires JWT
     */
    listTransfers(params, options) {
        return this.http.get("/v1/sub-partner/transfers", params, options);
    }
    /**
     * Get the actual information about the transfer. You need to provide the transfer ID in the request.
     * @requires JWT
     */
    getTransfer(transferId, options) {
        return this.http.get(`/v1/sub-partner/transfer/${transferId}`, undefined, options);
    }
    /**
     * With this method you can withdraw funds from a customer's account and transfer them to your master account.
     * @requires JWT
     */
    createWriteOff(payload, options) {
        return this.http.post("/v1/sub-partner/write-off", payload, options);
    }
}
//# sourceMappingURL=customers.js.map