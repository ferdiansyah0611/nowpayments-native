import { describe, it, expect, beforeEach, vi } from "vitest";
import { Conversion, NowPayments } from "../../src/index.js";
import { getToken, withAuthorization } from "../auth.js";

describe("ConversionResource E2E tests", () => {
  let client: NowPayments;
  let mockFetch: typeof fetch;
  let token: string;

  beforeEach(async () => {
    client = new NowPayments({
      apiKey: process.env.VITE_NOWPAYMENTS_API_KEY,
    });
    token = await getToken();
  });

  describe("create", () => {
    it("should call POST v1/conversion with conversion payload", async () => {
      const payload = {
        from_currency: "usd",
        to_currency: "btc",
        amount: 10,
      };

      try {
        await client.conversions.create(payload, withAuthorization(token));
      } catch(err: any) {
        expect(err.body).toBeDefined()
        expect(err.body.message).toBeDefined()
        expect(err.body.message).toEqual('Partner balance not found')
      }
    });
  });

  describe("get", () => {
    it("should call GET v1/conversion/:conversion_id", async () => {
      const conversionId = "conv-123";
      try {
        await client.conversions.get(conversionId, withAuthorization(token));
      } catch(err: any) {
        expect(err.body).toBeDefined()
        expect(err.body.message).toBeDefined()
        expect(err.body.message).toEqual('The server encountered an internal error')
      }
    });
  });

  describe("list", () => {
    it("should call GET v1/conversion with default params", async () => {
      const response = await client.conversions.list(undefined, withAuthorization(token));

      expect(response).toBeDefined();
    });

    it("should call GET v1/conversion with filter params", async () => {
      const params: Conversion.ListParams = {
        order: 'ASC',
        limit: 15
      };

      const response = await client.conversions.list(params, withAuthorization(token));

      expect(response).toBeDefined();
    });
  });
});