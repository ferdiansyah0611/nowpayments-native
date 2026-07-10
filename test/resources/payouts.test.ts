import { beforeEach, describe, expect, it, vi } from "vitest";
import NowPayments from "../../src/client";
import { fakeFetch, jsonResponse } from "../utils";

describe("NowPayments - Payouts", () => {
  let client: NowPayments;

  beforeEach(() => {
    client = new NowPayments({
      apiKey: "test-key",
      fetchImpl: fakeFetch(jsonResponse({ message: "OK" })),
    });
  });

  describe("payouts.create", () => {
    it("POSTs to /v1/payout with JWT auth", async () => {
      const fetchImpl = vi.fn(async (url: string, init?: RequestInit) => {
        expect(url).toContain("/v1/payout");
        expect(init?.method).toBe("POST");
        expect(init?.headers).toMatchObject({ Authorization: "Bearer my-jwt" });
        const body = JSON.parse(init?.body as string);
        expect(body).toMatchObject({
          address: "0xabc123",
          currency: "eth",
          amount: 0.5,
        });
        return jsonResponse({
          id: 12345,
          amount: 0.5,
          currency: "eth",
          address: "0xabc123",
          status: "CREATED",
          createdAt: "2022-10-09T21:56:33.754Z",
          updatedAt: "2022-10-09T21:56:33.754Z",
        });
      }) as unknown as typeof fetch;

      const c = new NowPayments({ jwt: "my-jwt", fetchImpl });
      const result = await c.payouts.create({
        address: "0xabc123",
        currency: "eth",
        amount: 0.5,
      });
      expect(result.id).toBe(12345);
      expect(result.status).toBe("CREATED");
    });
  });

  describe("payouts.list", () => {
    it("GETs /v1/payout with JWT auth and pagination params", async () => {
      const fetchImpl = vi.fn(async (url: string, init?: RequestInit) => {
        expect(url).toContain("/v1/payout");
        expect(url).toContain("limit=10");
        expect(url).toContain("page=0");
        expect(init?.headers).toMatchObject({ Authorization: "Bearer my-jwt" });
        return jsonResponse({
          data: [
            {
              id: 12345,
              amount: 0.5,
              currency: "eth",
              address: "0xabc123",
              status: "DONE",
              createdAt: "2022-10-09T21:56:33.754Z",
              updatedAt: "2022-10-09T21:56:33.754Z",
            },
          ],
          limit: 10,
          page: 0,
          pagesCount: 1,
          total: 1,
        });
      }) as unknown as typeof fetch;

      const c = new NowPayments({ jwt: "my-jwt", fetchImpl });
      const result = await c.payouts.list({ limit: 10, page: 0 });
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.pagesCount).toBe(1);
    });
  });

  describe("payouts.get", () => {
    it("GETs /v1/payout/:id with JWT auth", async () => {
      const fetchImpl = vi.fn(async (url: string, init?: RequestInit) => {
        expect(url).toContain("/v1/payout/12345");
        expect(init?.method).toBe("GET");
        expect(init?.headers).toMatchObject({ Authorization: "Bearer my-jwt" });
        return jsonResponse({
          id: 12345,
          amount: 0.5,
          currency: "eth",
          address: "0xabc123",
          status: "DONE",
          txHash: "0xdef456",
          createdAt: "2022-10-09T21:56:33.754Z",
          updatedAt: "2022-10-09T21:56:33.754Z",
        });
      }) as unknown as typeof fetch;

      const c = new NowPayments({ jwt: "my-jwt", fetchImpl });
      const result = await c.payouts.get(12345);
      expect(result.id).toBe(12345);
      expect(result.status).toBe("DONE");
      expect(result.txHash).toBe("0xdef456");
    });
  });

  describe("payouts.verifyBatchWithdrawal", () => {
    it("POSTs to /v1/payout/:batch-withdrawal-id/verify with JWT auth", async () => {
      const fetchImpl = vi.fn(async (url: string, init?: RequestInit) => {
        expect(url).toContain("/v1/payout/batch-123/verify");
        expect(init?.method).toBe("POST");
        expect(init?.headers).toMatchObject({ Authorization: "Bearer my-jwt" });
        const body = JSON.parse(init?.body as string);
        expect(body).toMatchObject({ verification_code: "123456" });
        return jsonResponse({
          result: "Verification successful",
        });
      }) as unknown as typeof fetch;

      const c = new NowPayments({ jwt: "my-jwt", fetchImpl });
      const result = await c.payouts.verifyBatchWithdrawal("batch-123", {
        verification_code: "123456",
      });
      expect(result.result).toBe("Verification successful");
    });
  });

  describe("payouts.getMinWithdrawalAmount", () => {
    it("GETs /v1/payout-withdrawal/min-amount/:coin with API key", async () => {
      const fetchImpl = vi.fn(async (url: string, init?: RequestInit) => {
        expect(url).toContain("/v1/payout-withdrawal/min-amount/eth");
        expect(init?.method).toBe("GET");
        expect(init?.headers).toMatchObject({ "x-api-key": "test-key" });
        return jsonResponse({
          success: true,
          result: 0.001,
        });
      }) as unknown as typeof fetch;

      const c = new NowPayments({ apiKey: "test-key", fetchImpl });
      const result = await c.payouts.getMinWithdrawalAmount("eth");
      expect(result.success).toBe(true);
      expect(result.result).toBe(0.001);
    });
  });

  describe("payouts.getFee", () => {
    it("GETs /v1/payout/fee with API key", async () => {
      const fetchImpl = vi.fn(async (url: string, init?: RequestInit) => {
        expect(url).toContain("/v1/payout/fee");
        expect(url).toContain("currency=eth");
        expect(url).toContain("amount=100");
        expect(init?.method).toBe("GET");
        expect(init?.headers).toMatchObject({ "x-api-key": "test-key" });
        return jsonResponse({
          currency: "eth",
          fee: 0.0005,
        });
      }) as unknown as typeof fetch;

      const c = new NowPayments({ apiKey: "test-key", fetchImpl });
      const result = await c.payouts.getFee({ currency: "eth", amount: 100 });
      expect(result.currency).toBe("eth");
      expect(result.fee).toBe(0.0005);
    });
  });

  describe("payouts.cancel", () => {
    it("DELETEs to /v1/payout/:id with JWT auth", async () => {
      const fetchImpl = vi.fn(async (url: string, init?: RequestInit) => {
        expect(url).toContain("/v1/payout/12345");
        expect(init?.method).toBe("DELETE");
        expect(init?.headers).toMatchObject({ Authorization: "Bearer my-jwt" });
        return jsonResponse({});
      }) as unknown as typeof fetch;

      const c = new NowPayments({ jwt: "my-jwt", fetchImpl });
      await c.payouts.cancel(12345);
    });
  });

  describe("payouts.cancelBatch", () => {
    it("DELETEs to /v1/payout/:batch_id/cancel-batch with JWT auth", async () => {
      const fetchImpl = vi.fn(async (url: string, init?: RequestInit) => {
        expect(url).toContain("/v1/payout/batch-123/cancel-batch");
        expect(init?.method).toBe("DELETE");
        expect(init?.headers).toMatchObject({ Authorization: "Bearer my-jwt" });
        return jsonResponse({});
      }) as unknown as typeof fetch;

      const c = new NowPayments({ jwt: "my-jwt", fetchImpl });
      await c.payouts.cancelBatch("batch-123");
    });
  });
});