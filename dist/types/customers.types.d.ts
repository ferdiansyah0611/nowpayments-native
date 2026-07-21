/**
 * Customer management (sub-partner) types for the NowPayments API.
 */
import type { CryptoCurrency, FiatCurrency, Money, PaymentStatus, ListTransfersStatus, TransactionStatus } from "./main.types.js";
export declare namespace Customer {
    /** Balance for a single currency held by a customer/sub-partner. */
    interface CurrencyBalance {
        /** Available amount. */
        amount: Money;
        /** Amount pending settlement. */
        pendingAmount: Money;
    }
    /** Customer balance response (returned by `GET /v1/sub-partner/balance/:id`). */
    interface Balance {
        /** The sub-partner/customer id. */
        subPartnerId: string;
        /** Map of currency ticker → balance. */
        balances: Record<string, CurrencyBalance>;
    }
    /** Wrapper for the customer balance response (`{ result: {...} }`). */
    interface BalanceResponse {
        result: Balance;
    }
    /** A single customer/sub-partner record. */
    interface Customer {
        /** Customer id. */
        id: string;
        /** Customer display name. */
        name: string;
        /** ISO 8601 creation timestamp. */
        created_at: string;
        /** ISO 8601 last-update timestamp. */
        updated_at: string;
    }
    /** Customers list response (returned by `GET /v1/sub-partner`). */
    interface ListResponse {
        result: Customer[];
        /** Total number of customers matching the query. */
        count: number;
    }
    /** Payload to create a new customer account. */
    interface CreatePayload {
        /** Customer display name. */
        name: string;
    }
    /** Created customer response (returned by `POST /v1/sub-partner`). */
    interface CreateResponse {
        result: Customer;
    }
    /** Payload to create a recurring payment for a customer. */
    interface CreateRecurringPaymentPayload {
        /** Id of the customer the recurring payment is created for. */
        customer_id: string;
        /** Recurring payment amount. */
        amount: Money;
        /** Currency ticker (e.g. `usdttrc20`). */
        currency: CryptoCurrency;
    }
    /** Recurring payment status. */
    type RecurringPaymentStatus = "CREATED" | "PROCESSING" | "DONE" | "FAILED";
    /** Created recurring payment response. */
    interface CreateRecurringPaymentResponse {
        result: {
            id: string;
            status: RecurringPaymentStatus;
            amount: Money;
            currency: CryptoCurrency;
        };
    }
    /** Parameters for listing customers. */
    interface ListParams {
        /** Filter by customer id. */
        id?: string;
        /** Number of records to skip. */
        offset?: number;
        /** Maximum number of records to return. */
        limit?: number;
        /** Sort direction. */
        order?: "ASC" | "DESC";
    }
    /** Customer payment record. */
    interface Payment {
        /** Payment id. */
        payment_id: number;
        /** Payment status. */
        payment_status: PaymentStatus;
        /** Deposit address. */
        pay_address: string;
        /** Amount to pay in crypto. */
        pay_amount: Money;
        /** Amount actually paid. */
        actually_paid?: Money;
        /** Fiat equivalent of actually paid amount. */
        actually_paid_at_fiat?: Money;
        /** Crypto currency. */
        pay_currency: CryptoCurrency;
        /** Fiat amount. */
        price_amount: Money;
        /** Fiat currency. */
        price_currency: FiatCurrency;
        /** Order ID. */
        order_id: string | null;
        /** Order description. */
        order_description: string | null;
        /** Purchase ID. */
        purchase_id: string | null;
        /** Outcome amount. */
        outcome_amount?: Money;
        /** Outcome currency. */
        outcome_currency?: CryptoCurrency;
        /** Parent payment ID (for repeated deposits). */
        parent_payment_id?: number | null;
        /** Invoice ID. */
        invoice_id?: string | null;
        /** Payment extra IDs. */
        payment_extra_ids?: string | null;
        /** Created at timestamp. */
        created_at: string;
        /** Updated at timestamp. */
        updated_at: string;
    }
    /** Payload to create a payment for a customer. */
    interface CreatePaymentPayload {
        currency: string;
        amount: number;
        sub_partner_id: string;
        is_fixed_rate: boolean;
        is_fee_paid_by_user: boolean;
        ipn_callback_url: string;
    }
    interface CreatePaymentResponse {
        result: Payment;
    }
    /** Customer payments list response. */
    interface PaymentsListResponse {
        result: Payment[];
        /** Total number of payments. */
        count: number;
    }
    /** Payload to deposit from master account to customer. */
    interface DepositPayload {
        currency: string;
        amount: number;
        sub_partner_id: string;
    }
    interface CreateDepositResponse {
        result: Deposit;
    }
    /** Deposit record. */
    interface Deposit {
        payment_id: string;
        payment_status: PaymentStatus;
        pay_address: string;
        price_amount: number;
        price_currency: string;
        pay_amount: number;
        amount_received: number;
        pay_currency: string;
        order_id: string | null;
        order_description: string | null;
        ipn_callback_url: string | null;
        created_at: string;
        updated_at: string;
        purchase_id: string;
        smart_contract: any;
        network: string;
        network_precision: any;
        time_limit: any;
        burning_percent: any;
        expiration_estimate_date: string;
        is_fixed_rate: boolean;
        is_fee_paid_by_user: boolean;
        valid_until: string;
        type: string;
    }
    /** Transfer record. */
    interface Transfer {
        id: string;
        from_sub_id: string;
        to_sub_id: string;
        status: TransactionStatus;
        created_at: string;
        updated_at: string;
        amount: string;
        currency: string;
    }
    /** Payload to transfer between customers. */
    interface TransferPayload {
        from_id: string;
        to_id: string;
        amount: string;
        currency: string;
    }
    /** Transfer list response. */
    interface TransferListResponse {
        result: Transfer[];
        /** Total number of transfers. */
        count: number;
    }
    /** Payload to write off on customer account. */
    interface WriteOffPayload {
        currency: string;
        amount: number;
        sub_partner_id: string;
    }
    interface WriteOffCreateResponse {
        result: {
            id: string;
            from_sub_id: string;
            to_sub_id: string;
            status: ListTransfersStatus;
            created_at: string;
            updated_at: string;
            amount: string;
            currency: string;
        };
    }
    interface ListPaymentsParams {
        /** amount of listed results */
        limit: number;
        /** set the offset for listed results */
        page?: number;
        /** filter by payment ID */
        id?: string;
        /** filter by deposit currency */
        pay_currency?: string;
        /** filter by status */
        status?: string;
        /** filter by sub-partner ID */
        sub_partner_id?: string;
        /** filter by date (from) */
        date_from?: string;
        /** filter by date (to) */
        date_to?: string;
        /** set the order for listed results (asc, desc) */
        orderBy?: "asc" | "desc";
        /** sort results by 'id', 'status', 'pay_currency', 'created_at', 'updated_at' */
        sortBy?: "id" | "status" | "pay_currency" | "created_at" | "updated_at";
    }
}
//# sourceMappingURL=customers.types.d.ts.map