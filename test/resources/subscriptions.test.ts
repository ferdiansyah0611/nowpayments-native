import { beforeEach, describe, expect, it, vi } from "vitest";
import NowPayments from "../../src/client";
import { fakeFetch, jsonResponse } from "../utils";

describe("NowPayments - Subscriptions", () => {
  let client: NowPayments;

  beforeEach(() => {
    client = new NowPayments({
      apiKey: "test-key",
      fetchImpl: fakeFetch(jsonResponse({ message: "OK" })),
    });
  });

  describe("subscriptions.createPayment", () => {
    it("POSTs to v1/subscriptions with JWT", async () => {
      const fetchImpl = vi.fn(async (url: string, init?: RequestInit) => {
        expect(url).toContain("v1/subscriptions");
        expect(init?.method).toBe("POST");
        expect(init?.headers).toMatchObject({ Authorization: "Bearer my-jwt" });
        const body = JSON.parse(init?.body as string);
        expect(body).toMatchObject({
          subscription_plan_id: "76215585",
          email: "user@example.com",
        });
        return jsonResponse({
          result: {
            id: "148427051",
            subscription_plan_id: "76215585",
            is_active: false,
            status: "WAITING_PAY",
            expire_date: "2022-10-10T13:46:18.476Z",
            subscriber: {
              email: "user@example.com",
            },
            created_at: "2022-10-10T13:46:18.476Z",
            updated_at: "2022-10-10T13:46:18.476Z",
          },
        });
      }) as unknown as typeof fetch;

      const c = new NowPayments({ jwt: "my-jwt", fetchImpl });
      const result = await c.subscriptions.createPayment({
        subscription_plan_id: "76215585",
        email: "user@example.com",
      });
      expect(result.result.subscription_plan_id).toBe("76215585");
      expect(result.result.status).toBe("WAITING_PAY");
    });
  });

  describe("subscriptions.listPayments", () => {
    it("GETs v1/subscriptions with pagination params", async () => {
      const fetchImpl = vi.fn(async (url: string, init?: RequestInit) => {
        expect(url).toContain("v1/subscriptions");
        expect(url).toContain("limit=10");
        expect(url).toContain("is_active=true");
        expect(init?.headers).toMatchObject({ Authorization: "Bearer my-jwt" });
        return jsonResponse({
          result: [
            {
              id: "sub-1",
              customer_id: "111394288",
              email: "user@example.com",
              amount: "10",
              currency: "usdttrc20",
              interval: "monthly",
              status: "ACTIVE",
            },
          ],
          count: 1,
        });
      }) as unknown as typeof fetch;

      const c = new NowPayments({ jwt: "my-jwt", fetchImpl });
      const result = await c.subscriptions.listPayments({ limit: 10, is_active: true });
      expect(result.result).toHaveLength(1);
      expect(result.count).toBe(1);
    });
  });

  describe("subscriptions.cancelPayment", () => {
    it("DELETEs to v1/subscriptions/:id", async () => {
      const fetchImpl = vi.fn(async (url: string, init?: RequestInit) => {
        expect(url).toContain("v1/subscriptions/sub-1");
        expect(init?.method).toBe("DELETE");
        return jsonResponse({
          result: {
            id: "sub-1",
            customer_id: "111394288",
            email: "user@example.com",
            amount: "10",
            currency: "usdttrc20",
            interval: "monthly",
            status: "CANCELLED",
          },
        });
      }) as unknown as typeof fetch;

      const c = new NowPayments({ jwt: "my-jwt", fetchImpl });
      const result = await c.subscriptions.cancelPayment("sub-1");
      expect(result.result.status).toBe("CANCELLED");
    });
  });

  describe("subscriptions.createPlan", () => {
    it("POSTs to v1/subscriptions/plans with JWT", async () => {
      const fetchImpl = vi.fn(async (url: string, init?: RequestInit) => {
        expect(url).toContain("v1/subscriptions/plans");
        expect(init?.method).toBe("POST");
        expect(init?.headers).toMatchObject({ Authorization: "Bearer my-jwt" });
        const body = JSON.parse(init?.body as string);
        expect(body).toMatchObject({
          title: "Monthly Premium Plan",
          interval_day: 30,
          amount: 9.99,
          currency: "usd",
          ipn_callback_url: "https://example.com/ipn",
          success_url: "https://example.com/success",
          cancel_url: "https://example.com/cancel",
        });
        return jsonResponse({
          result: {
            id: "1062307590",
            title: "Monthly Premium Plan",
            interval_day: "30",
            ipn_callback_url: "https://example.com/ipn",
            success_url: "https://example.com/success",
            cancel_url: "https://example.com/cancel",
            partially_paid_url: null,
            amount: 9.99,
            currency: "usd",
            created_at: "2022-10-04T16:28:55.423Z",
            updated_at: "2022-10-04T16:28:55.423Z",
          },
        });
      }) as unknown as typeof fetch;

      const c = new NowPayments({ jwt: "my-jwt", fetchImpl });
      const result = await c.subscriptions.createPlan({
        title: "Monthly Premium Plan",
        interval_day: 30,
        amount: 9.99,
        currency: "usd",
        ipn_callback_url: "https://example.com/ipn",
        success_url: "https://example.com/success",
        cancel_url: "https://example.com/cancel",
      });
      expect(result.result.id).toBe("1062307590");
      expect(result.result.title).toBe("Monthly Premium Plan");
      expect(result.result.amount).toBe(9.99);
    });
  });

  describe("subscriptions.getPlan", () => {
    it("GETs v1/subscriptions/plans/:id with API key", async () => {
      const fetchImpl = vi.fn(async (url: string, init?: RequestInit) => {
        expect(url).toContain("v1/subscriptions/plans/1062307590");
        expect(init?.method).toBe("GET");
        expect(init?.headers).toMatchObject({ "x-api-key": "my-api-key" });
        return jsonResponse({
          result: {
            id: "1062307590",
            title: "Monthly Premium Plan",
            interval_day: "30",
            ipn_callback_url: "https://example.com/ipn",
            success_url: "https://example.com/success",
            cancel_url: "https://example.com/cancel",
            partially_paid_url: null,
            amount: 9.99,
            currency: "usd",
            created_at: "2022-10-04T16:28:55.423Z",
            updated_at: "2022-10-04T16:28:55.423Z",
          },
        });
      }) as unknown as typeof fetch;

      const c = new NowPayments({ apiKey: "my-api-key", fetchImpl });
      const result = await c.subscriptions.getPlan("1062307590");
      expect(result.result.id).toBe("1062307590");
      expect(result.result.title).toBe("Monthly Premium Plan");
    });
  });

  describe("subscriptions.getAllPlans", () => {
    it("GETs v1/subscriptions/plans with pagination params", async () => {
      const fetchImpl = vi.fn(async (url: string, init?: RequestInit) => {
        expect(url).toContain("v1/subscriptions/plans");
        expect(url).toContain("limit=10");
        expect(url).toContain("offset=3");
        expect(init?.method).toBe("GET");
        expect(init?.headers).toMatchObject({ "x-api-key": "my-api-key" });
        return jsonResponse({
          result: [
            {
              id: "1062307590",
              title: "Monthly Premium Plan",
              interval_day: "30",
              ipn_callback_url: "https://example.com/ipn",
              success_url: "https://example.com/success",
              cancel_url: "https://example.com/cancel",
              partially_paid_url: null,
              amount: 9.99,
              currency: "usd",
              created_at: "2022-10-04T16:28:55.423Z",
              updated_at: "2022-10-04T16:28:55.423Z",
            },
          ],
          count: 1,
        });
      }) as unknown as typeof fetch;

      const c = new NowPayments({ apiKey: "my-api-key", fetchImpl });
      const result = await c.subscriptions.getAllPlans({ limit: 10, offset: 3 });
      expect(result.result).toHaveLength(1);
      expect(result.count).toBe(1);
    });
  });

  describe("subscriptions.updatePlan", () => {
    it("PATCHs to v1/subscriptions/plans/:id with JWT", async () => {
      const fetchImpl = vi.fn(async (url: string, init?: RequestInit) => {
        expect(url).toContain("v1/subscriptions/plans/1062307590");
        expect(init?.method).toBe("PATCH");
        expect(init?.headers).toMatchObject({ Authorization: "Bearer my-jwt" });
        const body = JSON.parse(init?.body as string);
        expect(body).toMatchObject({ title: "Monthly Premium Plan - Updated", amount: 14.99 });
        return jsonResponse({
          result: {
            id: "1062307590",
            title: "Monthly Premium Plan - Updated",
            interval_day: "30",
            ipn_callback_url: "https://example.com/ipn",
            success_url: "https://example.com/success",
            cancel_url: "https://example.com/cancel",
            partially_paid_url: null,
            amount: 14.99,
            currency: "usd",
            created_at: "2022-10-04T16:28:55.423Z",
            updated_at: "2022-10-04T16:28:55.423Z",
          },
        });
      }) as unknown as typeof fetch;

      const c = new NowPayments({ jwt: "my-jwt", fetchImpl });
      const result = await c.subscriptions.updatePlan("1062307590", {
        title: "Monthly Premium Plan - Updated",
        amount: 14.99,
      });
      expect(result.result.title).toBe("Monthly Premium Plan - Updated");
      expect(result.result.amount).toBe(14.99);
    });
  });

  describe("subscriptions.getPayment", () => {
    it("GETs v1/subscriptions/:id with API key", async () => {
      const fetchImpl = vi.fn(async (url: string, init?: RequestInit) => {
        expect(url).toContain("v1/subscriptions/1515573197");
        expect(init?.method).toBe("GET");
        expect(init?.headers).toMatchObject({ "x-api-key": "my-api-key" });
        return jsonResponse({
          result: {
            id: "1515573197",
            subscription_plan_id: "111394288",
            is_active: true,
            status: "PAID",
            expire_date: "2022-10-12T00:02:00.025Z",
            subscriber: {
              sub_partner_id: "111394288",
            },
            created_at: "2022-10-09T22:15:50.808Z",
            updated_at: "2022-10-09T22:15:50.808Z",
          },
        });
      }) as unknown as typeof fetch;

      const c = new NowPayments({ apiKey: "my-api-key", fetchImpl });
      const result = await c.subscriptions.getPayment("1515573197");
      expect(result.result.subscription_plan_id).toBe("111394288");
      expect(result.result.status).toBe("PAID");
    });
  });
});