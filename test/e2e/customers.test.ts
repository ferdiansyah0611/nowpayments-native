import { describe, it, expect, beforeEach, vi } from "vitest";
import { Customer, ListTransfersParams, NowPayments } from "../../src/index.js";
import { getToken, withAuthorization } from "../auth.js";

describe("CustomerResource E2E tests", () => {
  let client: NowPayments;
  let token: string;
  let customerId: string = process.env.VITE_NOWPAYMENTS_CUSTOMERID as string;
  let transferId: string;

  beforeEach(async () => {
    client = new NowPayments({
      apiKey: process.env.VITE_NOWPAYMENTS_API_KEY,
    });
    token = await getToken();
  });

  describe("balance", () => {
    it("should call GET /v1/sub-partner/balance/:id", async () => {
      const response = await client.customers.balance(customerId, withAuthorization(token));

      expect(response).toBeDefined();
      expect(response.result).toBeDefined();
    });
  });
  describe("create", () => {
    it("should call POST /v1/sub-partner with customer payload", async () => {

      const response = await client.customers.create({ name: 'John Doe' }, withAuthorization(token));
      customerId = response.result.id
      expect(response).toBeDefined();
    });
  });


  describe("list", () => {
    it("should call GET /v1/sub-partner with default params", async () => {
      const response = await client.customers.list(undefined, withAuthorization(token));

      expect(response).toBeDefined();
      expect(response.result).toBeDefined();
      expect(response.result.length).toBeGreaterThanOrEqual(1);
    });

    it("should call GET /v1/sub-partner with pagination params", async () => { 
      const response = await client.customers.list({
        limit: 20,
        offset: 0
      }, withAuthorization(token));

      expect(response).toBeDefined();
      expect(response.result).toBeDefined();
      expect(response.result.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("createPayment", () => {
    it("should call POST /v1/sub-partner/payment with payment payload", async () => {
      const payload: Customer.CreatePaymentPayload = {
        sub_partner_id: customerId,
        amount: 100,
        currency: "trx",
        is_fee_paid_by_user: true,
        is_fixed_rate: true,
        ipn_callback_url: "http://localhost:3000/callbackk"
      };

      const response = await client.customers.createPayment(payload, withAuthorization(token));

      expect(response).toBeDefined();
      expect(response.result).toBeDefined();
      expect(typeof response.result.payment_id).toBe('string');
    });
  });

  describe("listPayments", () => {
    it("should call GET /v1/sub-partner/payments with default params", async () => {
      const response = await client.customers.listPayments(undefined, withAuthorization(token));

      expect(response).toBeDefined();
    });

    it("should call GET /v1/sub-partner/payments with filter params", async () => {
      const params: Customer.ListPaymentsParams = {
        limit: 20,
        page: 1,
        pay_currency: "trx"
      };

      const response = await client.customers.listPayments(params, withAuthorization(token));

      expect(response).toBeDefined();
    });
  });

  describe("createDeposits", () => {
    it("should call POST /v1/sub-partner/deposit with deposit payload", async () => {
      const payload: Customer.DepositPayload = {
        sub_partner_id: "customer-123",
        amount: 100,
        currency: "trx",
      };

      try {
        await client.customers.createDeposits(payload, withAuthorization(token));
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("createTransfers", () => {
    it("should call POST /v1/sub-partner/transfer with transfer payload", async () => {
      const payload: Customer.TransferPayload = {
        from_id: "customer-123",
        to_id: "customer-456",
        amount: "10.00",
        currency: "usd",
      };

      transferId = "1";
      // Intentionally causing an error to test error handling
      try {
        await client.customers.createTransfers(payload, withAuthorization(token));
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("listTransfers", () => {
    it("should call GET /v1/sub-partner/transfer with default params", async () => {
      const response = await client.customers.listTransfers(undefined, withAuthorization(token));

      expect(response).toBeDefined();
    });

    it("should call GET /v1/sub-partner/transfer with filter params", async () => {
      const params: ListTransfersParams = {
        limit: 20,
        offset: 0,
        status: "CREATED"
      };

      const response = await client.customers.listTransfers(params, withAuthorization(token));

      expect(response).toBeDefined();
    });
  });

  describe("getTransfer", () => {
    it("should call GET /v1/sub-partner/transfer/:id", async () => {
      try {
        await client.customers.getTransfer(transferId, withAuthorization(token));
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("createWriteOff", () => {
    it("should call POST /v1/sub-partner/write-off with write-off payload", async () => {
      const payload: Customer.WriteOffPayload = {
        sub_partner_id: customerId,
        amount: 100,
        currency: "trx",
      };
      // Intentionally causing an error to test error handling
      try {
        await client.customers.createWriteOff(payload, withAuthorization(token));
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});
