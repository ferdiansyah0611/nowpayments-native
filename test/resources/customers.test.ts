import { beforeEach, describe, expect, it, vi } from "vitest";
import NowPayments from "../../src/client";
import { fakeFetch, jsonResponse } from "../utils";

describe("NowPayments - Customers", () => {
  let client: NowPayments;

  beforeEach(() => {
    client = new NowPayments({
      apiKey: "test-key",
      fetchImpl: fakeFetch(jsonResponse({ message: "OK" })),
    });
  });

  describe("customers.balance", () => {
    it("GETs /v1/sub-partner/balance/:id with the API key", async () => {
      const fetchImpl = vi.fn(async (url: string, init?: RequestInit) => {
        expect(url).toContain("/v1/sub-partner/balance/111394288");
        expect(init?.headers).toMatchObject({ "x-api-key": "test-key" });
        return jsonResponse({
          result: {
            subPartnerId: "111394288",
            balances: {
              usddtrc20: { amount: 0.7, pendingAmount: 0 },
              usdtbsc: { amount: 1.0001341847350678, pendingAmount: 0 },
            },
          },
        });
      }) as unknown as typeof fetch;

      const c = new NowPayments({ apiKey: "test-key", fetchImpl });
      const result = await c.customers.balance("111394288");
      expect(result.result.subPartnerId).toBe("111394288");
      expect(result.result.balances["usddtrc20"].amount).toBe(0.7);
    });
  });

  describe("customers.list", () => {
    it("GETs /v1/sub-partner with JWT and query params", async () => {
      const fetchImpl = vi.fn(async (url: string, init?: RequestInit) => {
        expect(url).toContain("/v1/sub-partner");
        expect(url).toContain("limit=10");
        expect(url).toContain("offset=1");
        expect(url).toContain("order=DESC");
        expect(init?.headers).toMatchObject({ Authorization: "Bearer my-jwt" });
        return jsonResponse({
          result: [
            { id: "111394288", name: "test", created_at: "", updated_at: "" },
            { id: "1515573197", name: "test1", created_at: "", updated_at: "" },
          ],
          count: 2,
        });
      }) as unknown as typeof fetch;

      const c = new NowPayments({ jwt: "my-jwt", fetchImpl });
      const result = await c.customers.list({ limit: 10, offset: 1, order: "DESC" });
      expect(result.count).toBe(2);
      expect(result.result).toHaveLength(2);
    });
  });

  describe("customers.create", () => {
    it("POSTs to /v1/sub-partner with the customer name", async () => {
      const fetchImpl = vi.fn(async (url: string, init?: RequestInit) => {
        expect(url).toContain("/v1/sub-partner");
        expect(init?.method).toBe("POST");
        const body = JSON.parse(init?.body as string);
        expect(body).toMatchObject({ name: "new_customer" });
        return jsonResponse({
          result: { id: "1515573197", name: "new_customer", created_at: "2022-10-09T21:56:33.754Z" },
        });
      }) as unknown as typeof fetch;

      const c = new NowPayments({ jwt: "my-jwt", fetchImpl });
      const result = await c.customers.create({ name: "new_customer" });
      expect(result.result.id).toBe("1515573197");
    });
  });

  describe("customer.createPayment", () => {
    it("POSTs to /v1/sub-partner/payment with JWT auth", async () => {
      const fetchImpl = vi.fn(async (url: string, init?: RequestInit) => {
        expect(url).toContain("/v1/sub-partner/payment");
        expect(init?.method).toBe("POST");
        const body = JSON.parse(init?.body as string);
        expect(body).toMatchObject({
          sub_partner_id: "123",
          amount: 50,
          currency: "trx",
          is_fixed_rate: false,
          is_fee_paid_by_user: false,
          ipn_callback_url: ''
        });
        return jsonResponse({
          result: {
            pay_amount: body.amount
          }
        });
      }) as unknown as typeof fetch;

      const c = new NowPayments({ jwt: "my-jwt", fetchImpl });
      const response = await c.customers.createPayment({
        sub_partner_id: "123",
        amount: 50,
        currency: "trx",
        is_fixed_rate: false,
        is_fee_paid_by_user: false,
        ipn_callback_url: ''
      });
      expect(response.result.pay_amount).toBe(50);
    });
  });

  describe("customer.listPayments", () => {
    it("GETs /v1/sub-partner/payments with JWT auth and pagination", async () => {
      const fetchImpl = vi.fn(async (url: string, init?: RequestInit) => {
        expect(url).toContain("/v1/sub-partner/payments");
        expect(url).toContain("limit=10");
        expect(url).toContain("page=0");
        expect(init?.headers).toMatchObject({ Authorization: "Bearer my-jwt" });
        return jsonResponse({
          result: [],
          limit: 10,
          page: 0,
          pagesCount: 0,
          total: 0,
        });
      }) as unknown as typeof fetch;

      const c = new NowPayments({ jwt: "my-jwt", fetchImpl });
      const response = await c.customers.listPayments({ limit: 10, page: 0 });
      expect(Array.isArray(response.result)).toBe(true);
    });
  });

  describe("customer.createDeposits", () => {
    it("POSTs to /v1/sub-partner/deposit with JWT auth", async () => {
      const fetchImpl = vi.fn(async (url: string, init?: RequestInit) => {
        expect(url).toContain("/v1/sub-partner/deposit");
        expect(init?.method).toBe("POST");
        const body = JSON.parse(init?.body as string);
        expect(body).toMatchObject({
          amount: 10,
          currency: "usdt",
          sub_partner_id: "123",
        });
        return jsonResponse({
          result: {
            pay_address: "19649354",
            pay_currency: "trx"
          },
        });
      }) as unknown as typeof fetch;

      const c = new NowPayments({ jwt: "my-jwt", fetchImpl });
      const response = await c.customers.createDeposits({
        amount: 10,
        currency: "usdt",
        sub_partner_id: "123",
      });
      expect(response.result.pay_address).toBe("19649354");
      expect(response.result.pay_currency).toBe("trx");
    });
  });

  describe("customer.transfer", () => {
    it("POSTs to /v1/sub-partner/transfer with JWT auth", async () => {
      const fetchImpl = vi.fn(async (url: string, init?: RequestInit) => {
        expect(url).toContain("/v1/sub-partner/transfer");
        expect(init?.method).toBe("POST");
        const body = JSON.parse(init?.body as string);
        expect(body).toMatchObject({
          from_id: "123",
          to_id: "456",
          amount: "10",
          currency: "usd",
        });
        return jsonResponse({
          result: { id: "1", amount: "10" },
        });
      }) as unknown as typeof fetch;

      const c = new NowPayments({ jwt: "my-jwt", fetchImpl });
      const response = await c.customers.createTransfers({
        from_id: "123",
        to_id: "456",
        amount: '10',
        currency: "usd",
      });
      expect(response.result.id).toBe("1");
      expect(response.result.amount).toBe("10");
    });
  });

  describe("customer.listTransfers", () => {
    it("GETs /v1/sub-partner/transfer with JWT auth and pagination", async () => {
      const fetchImpl = vi.fn(async (url: string, init?: RequestInit) => {
        expect(url).toContain("/v1/sub-partner/transfer");
        expect(url).toContain("limit=10");
        expect(url).toContain("offset=0");
        expect(url).toContain("status=CREATED");
        expect(url).toContain("order=ASC");
        expect(init?.headers).toMatchObject({ Authorization: "Bearer my-jwt" });
        return jsonResponse({
          result: [],
          limit: 10,
          offset: 0,
          count: 0,
        });
      }) as unknown as typeof fetch;

      const c = new NowPayments({ jwt: "my-jwt", fetchImpl });
      const result = await c.customers.listTransfers({ limit: 10, offset: 0, status: "CREATED", order: "ASC" });
      expect(result.count).toBe(0);
      expect(result.result).toHaveLength(0);
    });
  });

  describe("customer.getTransfer", () => {
    it("GETs /v1/sub-partner/transfer/:id with JWT auth", async () => {
      const fetchImpl = vi.fn(async (url: string, init?: RequestInit) => {
        expect(url).toContain("/v1/sub-partner/transfer/42");
        expect(init?.method).toBe("GET");
        expect(init?.headers).toMatchObject({ Authorization: "Bearer my-jwt" });
        return jsonResponse({
          id: 42,
          status: "finished",
        });
      }) as unknown as typeof fetch;

      const c = new NowPayments({ jwt: "my-jwt", fetchImpl });
      const result = await c.customers.getTransfer(42);
      expect(result.id).toBe(42);
      expect(result.status).toBe("finished");
    });
  });

  describe("customer.writeOff", () => {
    it("POSTs to /v1/sub-partner/write-off with JWT auth", async () => {
      const fetchImpl = vi.fn(async (url: string, init?: RequestInit) => {
        expect(url).toContain("/v1/sub-partner/write-off");
        expect(init?.method).toBe("POST");
        const body = JSON.parse(init?.body as string);
        expect(body).toMatchObject({
          sub_partner_id: "123",
          amount: 10,
          currency: "usd",
        });
        return jsonResponse({
          result: { id: "1", amount: "10" },
        });
      }) as unknown as typeof fetch;

      const c = new NowPayments({ jwt: "my-jwt", fetchImpl });
      const response = await c.customers.createWriteOff({
        sub_partner_id: "123",
        amount: 10,
        currency: "usd",
      });
      expect(response.result.id).toBe("1");
      expect(response.result.amount).toBe("10");
    });
  });
});