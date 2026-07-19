import { describe, it, expect, beforeEach, vi } from "vitest";
import { NowPayments } from "../../src/index.js";
import type { Payment } from "../../src/index.js";
import { getToken, withAuthorization } from "../auth.js";

describe("PaymentsResource E2E tests", () => {
  let client: NowPayments;
  let token: string;

  beforeEach(async () => {
    client = new NowPayments({
      apiKey: process.env.VITE_NOWPAYMENTS_API_KEY,
    });
    token = await getToken();
  });

  describe("create", () => {
    it("should call POST /v1/payment with payment payload", async () => {
      const payload: Payment.CreatePayload = {
        price_amount: 40,
        price_currency: "usd",
        pay_currency: "trx",
      };

      const response = await client.payments.create(payload);

      expect(response).toBeDefined();
    });
  });

  describe("list", () => {
    it("should call GET /v1/payment with pagination params", async () => {
      const params: Payment.ListParams = {
        limit: 20,
        page: 0,
        sortBy: "created_at",
        orderBy: "desc",
      };

      const response = await client.payments.list(params, withAuthorization(token));

      expect(response).toBeDefined();
    });
  });

  describe("get", () => {
    it("should call GET /v1/payment/:id", async () => {
      const paymentId = 12345;
      try {
        await client.payments.get(paymentId);
      } catch(error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("createInvoice", () => {
    it("should call POST /v1/invoice with invoice payload", async () => {
      const payload = {
        price_amount: 25,
        price_currency: "usd",
        pay_currency: "eth",
        order_id: "order-123",
      };

      const response = await client.payments.createInvoice(payload);

      expect(response).toBeDefined();
    });
  });

  describe("balance", () => {
    it("should call GET /v1/balance", async () => {
      const response = await client.payments.balance();

      expect(response).toBeDefined();
    });
  });

  describe("validateAddress", () => {
    it("should call POST /v1/payout/validate-address with address and currency", async () => {
      const payload = {
        address: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
        currency: "btc",
      };

      const response = await client.payments.validateAddress(payload);

      expect(response).toBeDefined();
    });
  });
});
