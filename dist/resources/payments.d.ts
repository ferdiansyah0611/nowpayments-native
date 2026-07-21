import type { RequestOptions } from "../http.js";
import type { PaginatedResponse } from "../types/index.js";
import type { Payment } from "../types/payments.types.js";
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
export declare class PaymentsResource extends Resource {
    /**
     * Creates payment. With this method, your customer will be able to complete the payment without leaving your website.
     * Be sure to consider the details of repeated and wrong-asset deposits from 'Repeated Deposits and Wrong-Asset Deposits' section when processing payments.
     * @requires APIKey
    */
    create(payload: Payment.CreatePayload, options?: RequestOptions): Promise<Payment.Payment>;
    /**
     * Returns the entire list of all transactions created with certain API key.
     * @requires JWT
     * @requires APIKey
     */
    list(params?: Payment.ListParams, options?: RequestOptions): Promise<PaginatedResponse<Payment.Payment>>;
    /**
     * Get the actual information about the payment. You need to provide the ID of the payment in the request.
     * @requires APIKey
     */
    get(paymentId: number | string, options?: RequestOptions): Promise<Payment.Payment>;
    /**
     * Creates a payment link. With this method, the customer is required to follow the generated url to complete the payment. Data must be sent as a JSON-object payload.
     * @requires APIKey
     */
    createInvoice(payload: Payment.CreateInvoicePayload, options?: RequestOptions): Promise<Payment.Invoice>;
    /**
     * This method returns your balance in different currencies.
     * @requires APIKey
     */
    balance(options?: RequestOptions): Promise<Payment.AccountBalance>;
    /**
     * This endpoint allows you to check if your payout address is valid and funds can be received there.
     * @requires APIKey
     */
    validateAddress(payload: Payment.ValidateAddressPayload, options?: RequestOptions): Promise<Payment.ValidateAddressResponse>;
}
//# sourceMappingURL=payments.d.ts.map