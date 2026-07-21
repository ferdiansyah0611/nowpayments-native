import type { RequestOptions } from "../http.js";
import type { ListTransfersParams } from "../types/index.js";
import type { Customer } from "../types/customers.types.js";
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
export declare class CustomerResource extends Resource {
    /**
     * This request can be made only from a whitelisted IP.
     * If IP whitelisting is disabled, this request can be made by any user that has an API key.
     * @requires APIKey
     */
    balance(customerId: string, options?: RequestOptions): Promise<Customer.BalanceResponse>;
    /**
     * This method returns the entire list of your customers.
     * @requires JWT
     */
    list(params?: Customer.ListParams, options?: RequestOptions): Promise<Customer.ListResponse>;
    /**
     * This is a method to create an account for your customer.
     * After this you'll be able to generate a payment(/v1/sub-partner/payment) or deposit(/v1/sub-partner/deposit)
     * for topping up its balance as well as withdraw funds from it.
     * @requires JWT
     */
    create(payload: Customer.CreatePayload, options?: RequestOptions): Promise<Customer.CreateResponse>;
    /**
     * This method allows you to top up a customer account with a general payment.
     * You can check the actual payment status by using GET 9 Get payment status request.
     * @requires JWT
     * @requires APIKey
     */
    createPayment(payload: Customer.CreatePaymentPayload, options?: RequestOptions): Promise<Customer.CreatePaymentResponse>;
    /**
     * This method allows you to get the list of all payments generated for a particular customer.
     * @requires JWT
     */
    listPayments(params?: Customer.ListPaymentsParams, options?: RequestOptions): Promise<Customer.PaymentsListResponse>;
    /**
     * This method allows you to top up a customer account with a general payment.
     * You can check the actual payment status by using GET 9 Get payment status request.
     * @requires JWT
     * @requires APIKey
     */
    createDeposits(payload: Customer.DepositPayload, options?: RequestOptions): Promise<Customer.CreateDepositResponse>;
    /**
     * This method allows creating transfers between users' accounts.
     * You can check the transfer's status using Get transfer method.
     * @requires JWT
     */
    createTransfers(params: Customer.TransferPayload, options?: RequestOptions): Promise<Customer.WriteOffCreateResponse>;
    /**
     * Returns the entire list of transfers created by your customers.
     * @requires JWT
     */
    listTransfers(params?: ListTransfersParams, options?: RequestOptions): Promise<Customer.TransferListResponse>;
    /**
     * Get the actual information about the transfer. You need to provide the transfer ID in the request.
     * @requires JWT
     */
    getTransfer(transferId: number | string, options?: RequestOptions): Promise<Customer.Transfer>;
    /**
     * With this method you can withdraw funds from a customer's account and transfer them to your master account.
     * @requires JWT
     */
    createWriteOff(payload: Customer.WriteOffPayload, options?: RequestOptions): Promise<Customer.WriteOffCreateResponse>;
}
//# sourceMappingURL=customers.d.ts.map