import { describe, it, expect } from "vitest";
import { verifyIpnSignature, sortObject } from "../src/ipn.js";

describe("sortObject", () => {
  it("sorts top-level keys alphabetically", () => {
    const sorted = sortObject({ b: 1, a: 2, c: 3 });
    expect(Object.keys(sorted)).toEqual(["a", "b", "c"]);
  });

  it("sorts nested object keys recursively", () => {
    const sorted = sortObject({ z: { y: 1, x: 2 }, a: 0 });
    expect(Object.keys(sorted)).toEqual(["a", "z"]);
    expect(Object.keys(sorted.z as object)).toEqual(["x", "y"]);
  });

  it("leaves arrays intact (sorts their elements if objects)", () => {
    const sorted = sortObject({ list: [{ b: 1, a: 2 }] });
    const first = (sorted.list as Array<Record<string, unknown>>)[0];
    expect(Object.keys(first)).toEqual(["a", "b"]);
  });

  it("returns primitives unchanged", () => {
    expect(sortObject(42 as unknown as object)).toBe(42);
    expect(sortObject(null)).toBe(null);
  });
});

describe("verifyIpnSignature", () => {
  it("returns false for empty inputs", async () => {
    await expect(verifyIpnSignature({}, "sig", "secret")).resolves.toBe(false);
    await expect(verifyIpnSignature({ a: 1 }, "", "secret")).resolves.toBe(false);
    await expect(verifyIpnSignature({ a: 1 }, "sig", "")).resolves.toBe(false);
  });

  it("returns false for a wrong signature", async () => {
    const result = await verifyIpnSignature({ a: 1 }, "deadbeef", "secret");
    expect(result).toBe(false);
  });

  it("returns true for a correct signature (sorted JSON, HMAC-SHA512)", async () => {
    const payload = { payment_id: 123, payment_status: "finished", b: 1, a: { z: 9, y: 8 } };
    const sorted = sortObject(payload);
    const body = JSON.stringify(sorted);

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode("secret"),
      { name: "HMAC", hash: "SHA-512" },
      false,
      ["sign"],
    );
    const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
    const hex = Array.from(new Uint8Array(sig))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    await expect(verifyIpnSignature(payload, hex, "secret")).resolves.toBe(true);
  });
});
