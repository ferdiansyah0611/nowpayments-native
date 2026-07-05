import { describe, it, expect, vi, beforeEach } from "vitest";
import { NowPayments } from "../src/client.js";
import { NowPaymentsError } from "../src/errors.js";

/** Builds a fake `fetch` that returns the given response. */
function fakeFetch(response: Response): typeof fetch {
  return vi.fn(async () => response) as unknown as typeof fetch;
}

/** Builds a JSON `Response`. */
function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("NowPayments", () => {
  let client: NowPayments;

  beforeEach(() => {
    client = new NowPayments({
      apiKey: "test-key",
      fetchImpl: fakeFetch(jsonResponse({ message: "OK" })),
    });
  });

  describe("constructor", () => {
    it("uses the default base URL", () => {
      const c = new NowPayments({ apiKey: "k" });
      expect(c).toBeInstanceOf(NowPayments);
    });

    it("warns when no credentials are provided", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      new NowPayments({});
      expect(warn).toHaveBeenCalled();
      warn.mockRestore();
    });
  });

  describe("auth.status", () => {
    it("calls GET /v1/status (public, no auth header required)", async () => {
      const fetchImpl = vi.fn(async (url: string) => {
        expect(url).toContain("/v1/status");
        return jsonResponse({ message: "OK" });
      }) as unknown as typeof fetch;

      const c = new NowPayments({ apiKey: "k", fetchImpl });
      const result = await c.auth.status();
      expect(result.message).toBe("OK");
    });
  });

  describe("auth.apiKeyStatus", () => {
    it("sends the API key header and parses the response", async () => {
      const fetchImpl = vi.fn(async (_url: string, init?: RequestInit) => {
        expect(init?.headers).toMatchObject({ "x-api-key": "test-key" });
        return jsonResponse({ result: true, message: "ok" });
      }) as unknown as typeof fetch;

      const c = new NowPayments({ apiKey: "test-key", fetchImpl });
      const result = await c.auth.apiKeyStatus();
      expect(result.result).toBe(true);
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
      const result = await c.payments.list({ limit: 10, page: 0 });
      expect(result.total).toBe(0);
      expect(result.pagesCount).toBe(0);
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

  describe("payments.getInvoice", () => {
    it("GETs /v1/invoice/:id and returns the invoice", async () => {
      const fetchImpl = vi.fn(async (url: string) => {
        expect(url).toContain("/v1/invoice/4522625843");
        return jsonResponse({
          id: 4522625843,
          order_id: "RGDBP-21314",
          order_description: "desc",
          price_amount: 1000,
          price_currency: "usd",
          pay_currency: null,
          ipn_callback_url: "",
          invoice_url: "https://nowpayments.io/payment/?iid=4522625843",
          success_url: "",
          cancel_url: "",
          created_at: "",
          updated_at: "",
        });
      }) as unknown as typeof fetch;

      const c = new NowPayments({ apiKey: "k", fetchImpl });
      const invoice = await c.payments.getInvoice(4522625843);
      expect(invoice.id).toBe(4522625843);
      expect(invoice.invoice_url).toContain("iid=4522625843");
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

  describe("error handling", () => {
    it("throws NowPaymentsError on non-2xx", async () => {
      const fetchImpl = fakeFetch(jsonResponse({ message: "Invalid API key" }, 401));
      const c = new NowPayments({ apiKey: "bad", fetchImpl });

      await expect(c.auth.apiKeyStatus()).rejects.toMatchObject({
        name: "NowPaymentsError",
        status: 401,
      });
    });

    it("includes the body on error", async () => {
      const fetchImpl = fakeFetch(jsonResponse({ message: "boom" }, 500));
      const c = new NowPayments({ apiKey: "k", fetchImpl });

      try {
        await c.payments.list();
      } catch (err) {
        expect(err).toBeInstanceOf(NowPaymentsError);
        expect((err as NowPaymentsError).body).toMatchObject({ message: "boom" });
      }
    });
  });

  describe("withJwt", () => {
    it("returns a new client with the JWT applied", async () => {
      const fetchImpl = vi.fn(async (_url: string, init?: RequestInit) => {
        expect(init?.headers).toMatchObject({ Authorization: "Bearer my-jwt" });
        return jsonResponse({ data: [], limit: 10, page: 0, pagesCount: 0, total: 0 });
      }) as unknown as typeof fetch;

      const c = new NowPayments({ apiKey: "k", fetchImpl });
      const jwtClient = c.withJwt("my-jwt");
      await jwtClient.payouts.list();
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

  describe("customers.createRecurringPayment", () => {
    it("POSTs to /v1/sub-partner/recurring", async () => {
      const fetchImpl = vi.fn(async (url: string, init?: RequestInit) => {
        expect(url).toContain("/v1/sub-partner/recurring");
        expect(init?.method).toBe("POST");
        const body = JSON.parse(init?.body as string);
        expect(body).toMatchObject({ customer_id: "111394288", amount: "50", currency: "usdttrc20" });
        return jsonResponse({
          result: { id: "987654321", status: "CREATED", amount: "50", currency: "usdttrc20" },
        });
      }) as unknown as typeof fetch;

      const c = new NowPayments({ jwt: "my-jwt", fetchImpl });
      const result = await c.customers.createRecurringPayment({
        customer_id: "111394288",
        amount: "50",
        currency: "usdttrc20",
      });
      expect(result.result.id).toBe("987654321");
      expect(result.result.status).toBe("CREATED");
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

  describe("subscriptions.createPayment", () => {
    it("POSTs to v1/subscriptions with API key", async () => {
      const fetchImpl = vi.fn(async (url: string, init?: RequestInit) => {
        expect(url).toContain("v1/subscriptions");
        expect(init?.method).toBe("POST");
        expect(init?.headers).toMatchObject({ "x-api-key": "my-api-key" });
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

      const c = new NowPayments({ apiKey: "my-api-key", fetchImpl });
      const result = await c.subscriptions.createPayment({
        subscription_plan_id: "76215585",
        email: "user@example.com",
      });
      expect(result.result.subscription_plan_id).toBe("76215585");
      expect(result.result.status).toBe("WAITING_PAY");
    });
  });

  describe("subscriptions.listPayments", () => {
    it("GETs v1/subscriptions with filters", async () => {
      const fetchImpl = vi.fn(async (url: string, init?: RequestInit) => {
        expect(url).toContain("v1/subscriptions");
        expect(url).toContain("status=PAID");
        expect(url).toContain("subscription_plan_id=111394288");
        expect(url).toContain("is_active=true");
        expect(url).toContain("limit=10");
        expect(url).toContain("offset=0");
        expect(init?.method).toBe("GET");
        expect(init?.headers).toMatchObject({ "x-api-key": "my-api-key" });
        return jsonResponse({
          result: [
            {
              id: "1515573197",
              subscription_plan_id: "111394288",
              is_active: true,
              status: "PAID",
              expire_date: "2022-10-11T00:02:00.025Z",
              subscriber: {
                sub_partner_id: "111394288",
              },
              created_at: "2022-10-09T22:15:50.808Z",
              updated_at: "2022-10-09T22:15:50.808Z",
            },
          ],
          count: 1,
        });
      }) as unknown as typeof fetch;

      const c = new NowPayments({ apiKey: "my-api-key", fetchImpl });
      const result = await c.subscriptions.listPayments({
        status: "PAID",
        subscription_plan_id: "111394288",
        is_active: true,
        limit: 10,
        offset: 0,
      });
      expect(result.result).toHaveLength(1);
      expect(result.count).toBe(1);
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

  describe("subscriptions.cancelPayment", () => {
    it("DELETEs to v1/subscriptions/:id with JWT", async () => {
      const fetchImpl = vi.fn(async (url: string, init?: RequestInit) => {
        expect(url).toContain("v1/subscriptions/1515573197");
        expect(init?.method).toBe("DELETE");
        expect(init?.headers).toMatchObject({ Authorization: "Bearer my-jwt" });
        return jsonResponse({
          result: "ok",
        });
      }) as unknown as typeof fetch;

      const c = new NowPayments({ jwt: "my-jwt", fetchImpl });
      const result = await c.subscriptions.cancelPayment("1515573197");
      expect(result.result).toBe("ok");
    });
  });
});
