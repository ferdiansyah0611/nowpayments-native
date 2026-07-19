import { beforeEach, describe, expect, it, vi } from "vitest";
import NowPayments from "../../src/client";
import { fakeFetch, jsonResponse } from "../utils";

describe("NowPayments - Auth", () => {
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
});