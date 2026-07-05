import { describe, it, expect } from "vitest";
import { NowPayments } from "../src/index.js";

describe("public API surface", () => {
  it("exposes resource namespaces", () => {
    const client = new NowPayments({ apiKey: "k" });
    expect(client.auth).toBeDefined();
    expect(client.currencies).toBeDefined();
    expect(client.payments).toBeDefined();
    expect(client.payouts).toBeDefined();
    expect(client.customers).toBeDefined();
    expect(client.subscriptions).toBeDefined();
  });
});
