import { describe, it, expect, beforeEach, vi } from "vitest";
import { NowPayments } from "../../src/index.js";
import type { Payout } from "../../src/index.js";
import { getToken, withAuthorization } from "../auth.js";

describe("PayoutsResource E2E tests", () => {
  let client: NowPayments;
  let token: string;

  beforeEach(async () => {
    client = new NowPayments({
      apiKey: process.env.VITE_NOWPAYMENTS_API_KEY,
    });
    token = await getToken();
  });

  describe("create", () => {
    it("should call POST /v1/payout with payout payload", async () => {
      const payload: Payout.CreatePayload = {
        withdrawals: [
          {
            "address": "2332323",
            "amount": "1000",
            "currency": "trx"
          }
        ]
      };

      try {
        await client.payouts.create(payload);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("list", () => {
    it("should call GET /v1/payout with default params", async () => {
      const response = await client.payouts.list();

      expect(response).toBeDefined();
    });

    it("should call GET /v1/payout with pagination params", async () => {
      const params: Payout.ListParams = {
        limit: 20,
        page: 2,
      };

      const response = await client.payouts.list(params);

      expect(response).toBeDefined();
    });
  });

  describe("get", () => {
    it("should call GET /v1/payout/:id", async () => {
      const payoutId = 12345;
      try {
        await client.payouts.get(payoutId);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("verifyBatchWithdrawal", () => {
    it("should call POST /v1/payout/:batch-withdrawal-id/verify", async () => {
      try {
        const batchWithdrawalId = "batch-123";
        await client.payouts.verifyBatchWithdrawal(batchWithdrawalId, { verification_code: "1234" }, withAuthorization(token));
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("getMinAmount", () => {
    it("should call GET /v1/payout-withdrawal/min-amount/:coin", async () => {
      const coin = "btc";
      const response = await client.payouts.getMinWithdrawalAmount(coin);

      expect(response).toBeDefined();
    });
  });

  describe("getFee", () => {
    it("should call GET /v1/payout/fee", async () => {
      const response = await client.payouts.getFee({ currency: 'trx', amount: 40 });

      expect(response).toBeDefined();
    });
  });

  describe("cancel", () => {
    it("should call POST /v1/payout/:payout_id/cancel", async () => {
      try {
        const payoutId = 12345;
        await client.payouts.cancel(payoutId);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("cancelBatch", () => {
    it("should call POST /v1/payout/:batch_id/cancel-batch", async () => {
      try {
        const batchId = "batch-123";
        await client.payouts.cancelBatch(batchId);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});