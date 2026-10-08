# NowPayments Native — API Usage Guide (for LLM)

Type-safe, zero-dependency TypeScript client for the [NowPayments.io](https://nowpayments.io) API.
Built on the platform `fetch` — no Node-only dependencies, works on edge runtimes.

## Setup

```ts
import { NowPayments } from "nowpayments-native";

// API key client (most endpoints)
const client = new NowPayments({
  apiKey: process.env.NOWPAYMENTS_API_KEY,
});

// Optional config (all fields optional)
const custom = new NowPayments({
  apiKey: process.env.NOWPAYMENTS_API_KEY,
  baseUrl: "https://api.nowpayments.io", // default
  timeoutMs: 30_000,                     // default
  fetchImpl: fetch,                      // custom fetch (tests / edge)
});
```

## Authentication

Two auth modes:

| Mode | How | Used by |
|------|-----|---------|
| **API key** | `new NowPayments({ apiKey })` | payments, currencies, invoices, balance, address validation, min withdrawal, fees, customer balance |
| **JWT** | `client.auth.token(...)` → `client.withJwt(token)` | payouts, customers, subscriptions, conversions |

```ts
// Exchange dashboard email/password for a JWT (expires in 5 minutes)
const { token } = await client.auth.token({
  email: "you@example.com",
  password: "your-password",
});

// Derive a new client that sends the JWT as a bearer token
const jwtClient = client.withJwt(token);
```

## Resources

| Resource | Client property | Docs |
|----------|-----------------|------|
| Auth & API status | `client.auth` | [auth.md](./auth.md) |
| Currencies & estimates | `client.currencies` | [currencies.md](./currencies.md) |
| Currency conversions | `client.conversions` | [conversions.md](./conversions.md) |
| Payments & invoices | `client.payments` | [payments.md](./payments.md) |
| Payouts (withdrawals) | `client.payouts` | [payouts.md](./payouts.md) |
| Customers (sub-partner) | `client.customers` | [customers.md](./customers.md) |
| Subscriptions (recurring) | `client.subscriptions` | [subscriptions.md](./subscriptions.md) |

**Validation:** setiap resource punya Zod schema di `src/validation/zod/` — lihat [validation.md](./validation.md).

Every resource method accepts an optional last `options?: RequestOptions` argument
(e.g. `{ signal: AbortSignal.timeout(5_000), headers: { ... } }`).

## Error handling

```ts
import { NowPaymentsError, NowPaymentsAbortError } from "nowpayments-native";

try {
  await client.payments.get(999);
} catch (err) {
  if (err instanceof NowPaymentsError) {
    // Non-2xx response: status, message, body, requestId
    console.error(err.status, err.message, err.body, err.requestId);
  } else if (err instanceof NowPaymentsAbortError) {
    // Timeout or AbortSignal triggered
    console.error("Request aborted");
  }
}
```

## IPN webhook verification

NowPayments signs each IPN webhook with HMAC-SHA512 of the request body
(keys sorted recursively) using your IPN secret. Signature arrives in `x-nowpayments-sig`.

```ts
import { verifyIpnSignature } from "nowpayments-native";

const body = await request.text();
const signature = request.headers.get("x-nowpayments-sig") ?? "";
const payload = JSON.parse(body);

const valid = await verifyIpnSignature(
  payload,
  signature,
  process.env.NOWPAYMENTS_IPN_SECRET,
);
if (!valid) {
  return new Response("Invalid signature", { status: 401 });
}

console.log(payload.payment_status, payload.order_id);
```
