import { beforeEach, describe, expect, it, vi } from "vitest";
import NowPayments from "../../src/client";
import { fakeFetch, jsonResponse } from "../utils";

describe("NowPayments - Payments", () => {
  let client: NowPayments;

  beforeEach(() => {
    client = new NowPayments({
      apiKey: "test-key",
      fetchImpl: fakeFetch(jsonResponse({ message: "OK" })),
    });
  });

  describe("payments.create", () => {
    it("POSTs the payload as JSON to /v1/payment", async () => {
      const fetchImpl = vi.fn(async (url: string, init?: RequestInit) => {
        expect(url).toContain("/v1/payment");
        expect(init?.method).toBe("POST");
        const body = JSON.parse(init?.body as string);
        expect(body).toMatchObject({ price_amount: 10, price_currency: "usd", pay_currency: "btc" });
        return jsonResponse({ payment_id: 1, payment_status: "waiting", pay_address: "0xabc" });
      }) as unknown as typeof fetch;

      const c = new NowPayments({ apiKey: "k", fetchImpl });
      const payment = await c.payments.create({
        price_amount: 10,
        price_currency: "usd",
        pay_currency: "btc",
      });

      expect(payment.payment_id).toBe(1);
      expect(payment.pay_address).toBe("0xabc");
    });
  });

  describe("payments.get", () => {
    it("builds the URL with the payment_id", async () => {
      const fetchImpl = vi.fn(async (url: string) => {
        expect(url).toContain("/v1/payment/42");
        return jsonResponse({ payment_id: 42, payment_status: "finished", pay_address: "0x1" });
      }) as unknown as typeof fetch;

      const c = new NowPayments({ apiKey: "k", fetchImpl });
      const payment = await c.payments.get(42);
      expect(payment.payment_id).toBe(42);
    });
  });

  describe("payments.list", () => {
    it("serializes query params and parses pagination", async () => {
      const fetchImpl = vi.fn(async (url: string) => {
        expect(url).toContain("limit=10");
        expect(url).toContain("page=0");
        return jsonResponse({ data: [], limit: 10, page: 0, pagesCount: 0, total: 0 });
      }) as unknown as typeof fetch;

      const c = new NowPayments({ apiKey: "k", fetchImpl });
      const result = await c.payments.list({ limit: 10, orderBy: 'asc', page: 0, sortBy: 'actually_paid' });
      expect(result.total).toBe(0);
      expect(result.pagesCount).toBe(0);
    });
  });

  describe("payments.createInvoice", () => {
    it("POSTs to /v1/invoice and returns the invoice_url", async () => {
      const fetchImpl = vi.fn(async (url: string, init?: RequestInit) => {
        expect(url).toContain("/v1/invoice");
        expect(init?.method).toBe("POST");
        return jsonResponse({
          id: 1,
          order_id: "o-1",
          order_description: "desc",
          price_amount: 50,
          price_currency: "usd",
          pay_currency: null,
          ipn_callback_url: "",
          invoice_url: "https://nowpayments.io/invoice/1",
          success_url: "",
          cancel_url: "",
          created_at: "",
          updated_at: "",
        });
      }) as unknown as typeof fetch;

      const c = new NowPayments({ apiKey: "k", fetchImpl });
      const invoice = await c.payments.createInvoice({ price_amount: 50, price_currency: "usd" });
      expect(invoice.invoice_url).toContain("/invoice/1");
    });
  });

  describe("payments.balance", () => {
    it("GETs /v1/balance and returns balances keyed by currency", async () => {
      const fetchImpl = vi.fn(async (url: string) => {
        expect(url).toContain("/v1/balance");
        return jsonResponse({
          eth: { amount: 0.00018, pendingAmount: 0 },
          trx: { amount: 0, pendingAmount: 0 },
        });
      }) as unknown as typeof fetch;

      const c = new NowPayments({ apiKey: "k", fetchImpl });
      const result = await c.payments.balance();
      expect(result.eth.amount).toBe(0.00018);
      expect(result.trx.pendingAmount).toBe(0);
    });
  });

  describe("payments.validateAddress", () => {
    it("POSTs to /v1/payout/validate-address and returns the validation result", async () => {
      const fetchImpl = vi.fn(async (url: string, init?: RequestInit) => {
        expect(url).toContain("/v1/payout/validate-address");
        expect(init?.method).toBe("POST");
        const body = JSON.parse(init?.body as string);
        expect(body).toMatchObject({ address: "0xabc", currency: "eth" });
        return jsonResponse({ status: false, statusCode: 400, message: "Invalid payout_address" });
      }) as unknown as typeof fetch;

      const c = new NowPayments({ apiKey: "k", fetchImpl });
      const result = await c.payments.validateAddress({
        address: "0xabc",
        currency: "eth",
        extra_id: null,
      });
      expect(result.status).toBe(false);
      expect(result.statusCode).toBe(400);
    });
  });
});