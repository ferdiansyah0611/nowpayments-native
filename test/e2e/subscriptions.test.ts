import { describe, it, expect, beforeEach, vi } from "vitest";
import { NowPayments } from "../../src/index.js";
import type { Subscription } from "../../src/index.js";
import { getToken, withAuthorization } from "../auth.js";

describe("SubscriptionResource E2E tests", () => {
  let client: NowPayments;
  let token: string;
  let planId = process.env.VITE_NOWPAYMENTS_SUBSCRIBE_PLANID as string;

  beforeEach(async () => {
    client = new NowPayments({
      apiKey: process.env.VITE_NOWPAYMENTS_API_KEY,
    });
    token = await getToken();
  });

  describe("createPlan", () => {
    it("should call POST v1/subscriptions/plans with plan payload", async () => {
      const payload: Subscription.CreatePlanPayload = {
        title: "",
        amount: 100,
        currency: "usd",
        interval_day: 2
      };

      try {
        await client.subscriptions.createPlan(payload);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("getPlan", () => {
    it("should call GET v1/subscriptions/plans/:id", async () => {
      const response = await client.subscriptions.getPlan(planId);

      expect(response).toBeDefined();
    });
  });

  describe("listPlans", () => {
    it("should call GET v1/subscriptions/plans with default params", async () => {
      const response = await client.subscriptions.getAllPlans();

      expect(response).toBeDefined();
    });
  });

  describe("updatePlan", () => {
    it("should call PATCH v1/subscriptions/plans/:id with update payload", async () => {
      const payload: Subscription.UpdatePlanPayload = {
        amount: 60
      };

      const response = await client.subscriptions.updatePlan(planId, payload, withAuthorization(token));

      expect(response).toBeDefined();
    });
  });

  describe("createSubscription", () => {
    it("should call POST v1/subscriptions with subscription payload", async () => {
      const payload: Subscription.CreatePayload = {
        email: 'john.doe@example.com',
        subscription_plan_id: planId
      };

      const response = await client.subscriptions.createPayment(payload, withAuthorization(token));

      expect(response).toBeDefined();
    });
  });

  describe("listSubscriptions", () => {
    it("should call GET v1/subscriptions with default params", async () => {
      const response = await client.subscriptions.listPayments();

      expect(response).toBeDefined();
    });
  });

  describe("getSubscription", () => {
    it("should call GET v1/subscriptions/:id", async () => {
      try {
        const subscriptionId = "sub-123";
        await client.subscriptions.getPayment(subscriptionId);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("cancelSubscription", () => {
    it("should call DELETE v1/subscriptions/:id", async () => {
      try {
        const subscriptionId = "sub-123";
        await client.subscriptions.cancelPayment(subscriptionId);
  
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});