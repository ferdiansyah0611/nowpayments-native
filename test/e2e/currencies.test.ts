import { describe, it, expect, beforeEach } from "vitest";
import { NowPayments } from "../../src/index.js";
import { getToken, withAuthorization } from "../auth.js";

describe("CurrenciesResource E2E tests", () => {
  let client: NowPayments;
  let token: string;

  beforeEach(async () => {
    client = new NowPayments({
      apiKey: process.env.VITE_NOWPAYMENTS_API_KEY,
    });
    token = await getToken();
  });

  describe("list", () => {
    it("should call GET /v1/currencies with default params", async () => {
      const response = await client.currencies.list(undefined, withAuthorization(token));

      expect(response).toBeDefined()
      expect(response.currencies).toBeDefined()
      expect(response.currencies.length).toBeGreaterThan(1)
    });

    it("should call GET /v1/currencies with fixed_rate param", async () => {
      const response = await client.currencies.list({ fixed_rate: true });

      expect(response).toBeDefined()
      expect(response.currencies).toBeDefined()
      expect(response.currencies.length).toBeGreaterThan(1)
    });
  });

  describe("full", () => {
    it("should call GET /v1/full-currencies", async () => {
      const response = await client.currencies.full();

      expect(response).toBeDefined()
      expect(response.currencies).toBeDefined()
      expect(response.currencies.length).toBeGreaterThan(1)
    });
  });

  describe("checked", () => {
    it("should call GET /v1/merchant/coins", async () => {
      const response = await client.currencies.checked();

      expect(response).toBeDefined()
      expect(response.selectedCurrencies).toBeDefined()
      expect(response.selectedCurrencies.length).toBeGreaterThan(1)
    });
  });
});
