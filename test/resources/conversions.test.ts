import { beforeEach, describe, expect, it, vi } from "vitest";
import NowPayments from "../../src/client";
import { fakeFetch, jsonResponse } from "../utils";

describe("NowPayments - Conversions", () => {
  let client: NowPayments;

  beforeEach(() => {
    client = new NowPayments({
      apiKey: "test-key",
      fetchImpl: fakeFetch(jsonResponse({ message: "OK" })),
    });
  });

  describe("conversions.create", () => {
    it("POSTs to v1/conversion with JWT auth", async () => {
      const fetchImpl = vi.fn(async (url: string, init?: RequestInit) => {
        expect(url).toContain("v1/conversion");
        expect(init?.method).toBe("POST");
        expect(init?.headers).toMatchObject({ Authorization: "Bearer my-jwt" });
        const body = JSON.parse(init?.body as string);
        expect(body).toMatchObject({
          amount: 50,
          from_currency: "USDTTRC20",
          to_currency: "USDTERC20",
        });
        return jsonResponse({
          result: {
            id: "1327866232",
            status: "WAITING",
            created_at: "2022-10-09T21:56:33.754Z",
          },
        });
      }) as unknown as typeof fetch;

      const c = new NowPayments({ jwt: "my-jwt", fetchImpl });
      const result = await c.conversions.create({
        amount: 50,
        from_currency: "USDTTRC20",
        to_currency: "USDTERC20",
      });
      expect(result.result.id).toBe("1327866232");
      expect(result.result.status).toBe("WAITING");
    });
  });

  describe("conversions.get", () => {
    it("GETs v1/conversion/:id with JWT auth", async () => {
      const fetchImpl = vi.fn(async (url: string, init?: RequestInit) => {
        expect(url).toContain("v1/conversion/1327866232");
        expect(init?.method).toBe("GET");
        expect(init?.headers).toMatchObject({ Authorization: "Bearer my-jwt" });
        return jsonResponse({
          result: {
            id: "1327866232",
            status: "FINISHED",
            from_currency: "USDTTRC20",
            to_currency: "USDTERC20",
            amount_from: 50,
            amount_to: 49.95,
            created_at: "2022-10-09T21:56:33.754Z",
            updated_at: "2022-10-09T21:56:33.754Z",
          },
        });
      }) as unknown as typeof fetch;

      const c = new NowPayments({ jwt: "my-jwt", fetchImpl });
      const result = await c.conversions.get("1327866232");
      expect(result.result.id).toBe("1327866232");
      expect(result.result.status).toBe("FINISHED");
    });
  });

  describe("conversions.list", () => {
    it("GETs v1/conversion with filters and pagination", async () => {
      const fetchImpl = vi.fn(async (url: string, init?: RequestInit) => {
        expect(url).toContain("v1/conversion");
        expect(url).toContain("status=FINISHED");
        expect(url).toContain("from_currency=TRX");
        expect(url).toContain("limit=10");
        expect(url).toContain("offset=0");
        expect(url).toContain("order=DESC");
        expect(init?.headers).toMatchObject({ Authorization: "Bearer my-jwt" });
        return jsonResponse({
          result: [
            {
              id: "1327866232",
              status: "FINISHED",
              from_currency: "TRX",
              to_currency: "USD",
              amount_from: 100,
              amount_to: 1.5,
              created_at: "2022-10-09T21:56:33.754Z",
              updated_at: "2022-10-09T21:56:33.754Z",
            },
          ],
          count: 1,
        });
      }) as unknown as typeof fetch;

      const c = new NowPayments({ jwt: "my-jwt", fetchImpl });
      const result = await c.conversions.list({
        status: "FINISHED",
        from_currency: "TRX",
        limit: 10,
        offset: 0,
        order: "DESC",
      });
      expect(result.result).toHaveLength(1);
      expect(result.count).toBe(1);
    });
  });
});