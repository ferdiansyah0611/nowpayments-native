import { beforeEach, describe, expect, it, vi } from "vitest";
import NowPayments from "../../src/client";
import { fakeFetch, jsonResponse } from "../utils";

describe("NowPayments - Currencies", () => {
  let client: NowPayments;

  beforeEach(() => {
    client = new NowPayments({
      apiKey: "test-key",
      fetchImpl: fakeFetch(jsonResponse({ message: "OK" })),
    });
  });

  describe("currencies.list", () => {
    it("returns currencies as string tickers", async () => {
      const fetchImpl = vi.fn(async (url: string) => {
        expect(url).toContain("/v1/currencies");
        return jsonResponse({ currencies: ["btc", "eth", "usdttrc20"] });
      }) as unknown as typeof fetch;
      const c = new NowPayments({ apiKey: "k", fetchImpl });
      const result = await c.currencies.list();
      expect(result.currencies).toEqual(["btc", "eth", "usdttrc20"]);
    });

    it("forwards the fixed_rate query param when provided", async () => {
      const fetchImpl = vi.fn(async (url: string) => {
        expect(url).toContain("fixed_rate=true");
        return jsonResponse({ currencies: ["btc", "eth"] });
      }) as unknown as typeof fetch;
      const c = new NowPayments({ apiKey: "k", fetchImpl });
      const result = await c.currencies.list({ fixed_rate: true });
      expect(result.currencies).toEqual(["btc", "eth"]);
    });
  });

  describe("currencies.full", () => {
    it("GETs /v1/full-currencies and returns detailed records", async () => {
      const fetchImpl = vi.fn(async (url: string) => {
        expect(url).toContain("/v1/full-currencies");
        return jsonResponse({
          currencies: [
            {
              id: 121,
              code: "AAVE",
              name: "Aave",
              enable: true,
              wallet_regex: "^(0x)[0-9A-Fa-f]{40}$",
              priority: 127,
              extra_id_exists: false,
              logo_url: "/images/coins/aave.svg",
              network: "eth",
            },
          ],
        });
      }) as unknown as typeof fetch;
      const c = new NowPayments({ apiKey: "k", fetchImpl });
      const result = await c.currencies.full();
      expect(result.currencies[0]?.code).toBe("AAVE");
      expect(result.currencies[0]?.network).toBe("eth");
    });
  });

  describe("currencies.checked", () => {
    it("GETs /v1/merchant/coins and returns enabled tickers", async () => {
      const fetchImpl = vi.fn(async (url: string) => {
        expect(url).toContain("/v1/merchant/coins");
        return jsonResponse({ currencies: ["btc", "eth", "usdttrc20"] });
      }) as unknown as typeof fetch;
      const c = new NowPayments({ apiKey: "k", fetchImpl });
      const result = await c.currencies.checked();
      expect(result.currencies).toEqual(["btc", "eth", "usdttrc20"]);
    });
  });

  describe("currencies.estimate", () => {
    it("returns the estimated amount", async () => {
      const fetchImpl = fakeFetch(
        jsonResponse({ currency_from: "usd", amount_from: 10, currency_to: "btc", estimated_amount: 0.00016 }),
      );
      const c = new NowPayments({ apiKey: "k", fetchImpl });
      const result = await c.currencies.estimate({
        amount: 10,
        currency_from: "usd",
        currency_to: "btc",
      });
      expect(result.estimated_amount).toBe(0.00016);
    });
  });

  describe("currencies.minimumAmount", () => {
    it("returns the min_amount", async () => {
      const fetchImpl = fakeFetch(
        jsonResponse({ currency_from: "btc", currency_to: "usd", min_amount: 0.001 }),
      );
      const c = new NowPayments({ apiKey: "k", fetchImpl });
      const result = await c.currencies.minimumAmount({ currency_from: "btc", currency_to: "usd" });
      expect(result.min_amount).toBe(0.001);
    });
  });
});