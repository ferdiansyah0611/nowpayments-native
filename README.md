# nowpayments-native

A type-safe, dependency-free TypeScript client for the [NowPayments.io](https://nowpayments.io) API.

Built for edge runtimes (Cloudflare Workers, Vercel Edge, Deno, Bun) and browsers — uses the platform `fetch`, no Node-only dependencies.

Synchronized with the [official API documentation](https://documenter.getpostman.com/view/7907941/2s93JusNJt) and the [`@nowpaymentsio/nowpayments-api-js`](https://github.com/NowPaymentsIO/nowpayments-api-js) reference implementation.

## Features

- 🔒 **Type-safe** — strict TypeScript types for every request and response.
- 🪶 **Zero dependencies** — uses the platform `fetch`.
- 🧹 **Clean Code** — small, focused modules; resource namespaces.
- ⏱️ **Timeouts & abort** — per-request `AbortSignal` and configurable timeout.
- 🔐 **Auth** — API key or JWT bearer; IPN signature verification.
- 🌐 **Edge-ready** — no Node built-ins required.

## Installation

```bash
npm install nowpayments-native
```

## Usage

```ts
import { NowPayments } from "nowpayments-native";

const client = new NowPayments({
  apiKey: process.env.NOWPAYMENTS_API_KEY!,
});

// Check API availability (public, no auth required)
const { message } = await client.auth.status();

// List available currencies
const { currencies } = await client.currencies.list();
// => ["btc", "eth", "usdttrc20", ...]

// List only fixed-rate currencies
const fixed = await client.currencies.list({ fixed_rate: true });

// Get detailed currency info (name, logo, network, wallet regex, …)
const full = await client.currencies.full();
// => { currencies: [{ id, code, name, enable, wallet_regex, priority, ... }] }

// Get currencies enabled in the merchant account (Coins Settings)
const checked = await client.currencies.checked();
// => { currencies: ["btc", "eth", "usdttrc20", ...] }

// Get the estimated price for a currency pair
const estimate = await client.currencies.estimate({
  amount: 10,
  currency_from: "usd",
  currency_to: "btc",
});
// => { currency_from, amount_from, currency_to, estimated_amount }

// Get the minimum payment amount
const min = await client.currencies.minimumAmount({
  currency_from: "btc",
  currency_to: "usd",
});
// => { currency_from, currency_to, min_amount }

// Create a payment
const payment = await client.payments.create({
  price_amount: 10,
  price_currency: "usd",
  pay_currency: "btc",
  order_id: "order-123",
  ipn_callback_url: "https://example.com/ipn",
});
// => { payment_id, payment_status, pay_address, pay_amount, ... }

// List payments (paginated)
const list = await client.payments.list({ limit: 10, page: 0 });
// => { data, limit, page, pagesCount, total }

// Get a single payment by payment_id
const fetched = await client.payments.get(payment.payment_id);

// Create an invoice (payment link)
const invoice = await client.payments.createInvoice({
  price_amount: 50,
  price_currency: "usd",
  order_id: "order-456",
  success_url: "https://example.com/success",
  cancel_url: "https://example.com/cancel",
});
// => { id, invoice_url, ... }

// Get a single invoice
const inv = await client.payments.getInvoice(invoice.id);

// Check account balances (keyed by currency ticker)
const balance = await client.payments.balance();
// => { eth: { amount, pendingAmount }, trx: { amount, pendingAmount }, ... }

// Validate a payout address before withdrawing
const validation = await client.payments.validateAddress({
  address: "0xabc...",
  currency: "eth",
});
// => { status, statusCode?, message? }

// Customer management (sub-partners)
// Get a customer's balance (API key)
const { result: customerBalance } = await client.customers.balance("111394288");
// => { subPartnerId, balances: { usdttrc20: { amount, pendingAmount }, ... } }

// List customers (JWT required)
const jwtClient = client.withJwt(token);
const { result: customers, count } = await jwtClient.customers.list({
  limit: 10,
  offset: 0,
  order: "DESC",
});

// Create a new customer (JWT required)
const { result: newCustomer } = await jwtClient.customers.create({ name: "new_customer" });

// Create a recurring payment for a customer (JWT required)
const { result: recurring } = await jwtClient.customers.createRecurringPayment({
  customer_id: "111394288",
  amount: "50",
  currency: "usdttrc20",
});
// => { id, status: "CREATED", amount, currency }

// Email subscriptions (recurring billing via email, JWT required)
const { result: sub } = await jwtClient.subscriptions.create({
  customer_id: "111394288",
  email: "user@example.com",
  amount: "10",
  currency: "usdttrc20",
  interval: "monthly",
});

// List subscriptions
const { result: subs, count } = await jwtClient.subscriptions.list({ limit: 10, page: 0 });

// Update a subscription (amount, currency, interval)
await jwtClient.subscriptions.update(sub.id, { amount: "15", interval: "weekly" });

// Cancel a subscription
await jwtClient.subscriptions.cancel(sub.id);

// Subscription plans (recurring payment plans, JWT required)
const { result: plan } = await jwtClient.subscriptions.createPlan({
  title: "Monthly Premium Plan",
  interval_day: 30,
  amount: 9.99,
  currency: "usd",
  ipn_callback_url: "https://example.com/ipn",
  success_url: "https://example.com/success",
  cancel_url: "https://example.com/cancel",
});

// List all plans
const { result: plans } = await client.subscriptions.getAllPlans({ limit: 10, offset: 0 });

// Get a single plan
const { result: fetchedPlan } = await client.subscriptions.getPlan(plan.id);

// Update a plan
await jwtClient.subscriptions.updatePlan(plan.id, {
  title: "Monthly Premium Plan - Updated",
  amount: 14.99,
});

// Subscription payments (recurring payments, API key or JWT required)
const { result: payment } = await client.subscriptions.createPayment({
  subscription_plan_id: "76215585",
  email: "user@example.com",
});

// List subscription payments with filters
const { result: payments, count } = await client.subscriptions.listPayments({
  status: "PAID",
  subscription_plan_id: "111394288",
  is_active: true,
  limit: 10,
  offset: 0,
});

// Get a single subscription payment
const { result: fetchedPayment } = await client.subscriptions.getPayment(payment.id);

// Cancel a subscription payment
await jwtClient.subscriptions.cancelPayment(payment.id);
```

## Authentication

Most endpoints require an API key (passed in the `x-api-key` header). Payouts
require a JWT bearer token obtained via `POST /v1/auth`:

```ts
const client = new NowPayments({ apiKey: process.env.NOWPAYMENTS_API_KEY });

// Exchange email/password for a JWT
const { token } = await client.auth.token({
  email: "you@example.com",
  password: "your-password",
});

// Use the JWT for subsequent calls
const jwtClient = client.withJwt(token);
await jwtClient.payouts.create({ /* ... */ });
```

## IPN webhook verification

NowPayments signs each IPN webhook with HMAC-SHA512 of the request body (with
keys sorted recursively) using your IPN secret key. The signature is sent in
the `x-nowpayments-sig` header.

```ts
import { verifyIpnSignature } from "nowpayments-native";

const body = await request.text();
const signature = request.headers.get("x-nowpayments-sig") ?? "";
const payload = JSON.parse(body);

const valid = await verifyIpnSignature(payload, signature, process.env.NOWPAYMENTS_IPN_SECRET);
if (!valid) {
  return new Response("Invalid signature", { status: 401 });
}

console.log(payload.payment_status, payload.order_id);
```

## Error handling

All non-2xx responses throw a `NowPaymentsError` with the status, body, and
request id:

```ts
import { NowPaymentsError } from "nowpayments-native";

try {
  await client.payments.get(999);
} catch (err) {
  if (err instanceof NowPaymentsError) {
    console.error(err.status, err.message, err.body, err.requestId);
  }
}
```

## API surface

All endpoints are under `https://api.nowpayments.io/v1/`.

| Resource      | Method        | Endpoint                  | Auth     |
|---------------|---------------|---------------------------|----------|
| `auth`        | `status`      | `GET /v1/status`          | none     |
| `auth`        | `apiKeyStatus`| `GET /v1/auth/decoded`    | API key  |
| `auth`        | `token`       | `POST /v1/auth`           | none     |
| `currencies`  | `list`        | `GET /v1/currencies`      | API key  |
| `currencies`  | `full`        | `GET /v1/full-currencies` | API key  |
| `currencies`  | `checked`     | `GET /v1/merchant/coins`  | API key  |
| `currencies`  | `minimumAmount` | `GET /v1/min-amount`    | API key  |
| `currencies`  | `estimate`    | `GET /v1/estimate`        | API key  |
| `payments`    | `create`      | `POST /v1/payment`        | API key  |
| `payments`    | `list`        | `GET /v1/payment`        | API key  |
| `payments`    | `get`         | `GET /v1/payment/{id}`    | API key  |
| `payments`    | `createInvoice` | `POST /v1/invoice`     | API key  |
| `payments`    | `getInvoice`  | `GET /v1/invoice/{id}`    | API key  |
| `payments`    | `balance`     | `GET /v1/balance`         | API key  |
| `payments`    | `validateAddress` | `POST /v1/payout/validate-address` | API key |
| `payouts`     | `create`      | `POST /v1/payout`         | JWT      |
| `payouts`     | `list`        | `GET /v1/payout`          | JWT      |
| `payouts`     | `get`         | `GET /v1/payout/{id}`     | JWT      |
| `payouts`     | `verifyBatchWithdrawal` | `POST /v1/payout/:batch-withdrawal-id/verify` | JWT |
| `payouts`     | `getMinWithdrawalAmount` | `GET /v1/payout-withdrawal/min-amount/:coin` | API key |
| `payouts`     | `getFee`      | `GET /v1/payout/fee`      | API key  |
| `payouts`     | `cancel`      | `POST /v1/payout/:payout_id/cancel` | JWT |
| `payouts`     | `cancelBatch` | `POST /v1/payout/:batch_id/cancel-batch` | JWT |
| `customers`   | `balance`     | `GET /v1/sub-partner/balance/{id}` | API key |
| `customers`   | `list`        | `GET /v1/sub-partner`     | JWT      |
| `customers`   | `create`      | `POST /v1/sub-partner`    | JWT      |
| `customers`   | `createRecurringPayment` | `POST /v1/sub-partner/recurring` | JWT |
| `subscriptions` | `create`  | `POST v1/subscriptions` | JWT |
| `subscriptions` | `list`    | `GET v1/subscriptions` | JWT |
| `subscriptions` | `update`  | `PUT v1/subscriptions/{id}` | JWT |
| `subscriptions` | `cancel`  | `POST v1/subscriptions/{id}/cancel` | JWT |
| `subscriptions` | `createPlan` | `POST v1/subscriptions/plans` | JWT |
| `subscriptions` | `getPlan` | `GET v1/subscriptions/plans/{id}` | API key |
| `subscriptions` | `getAllPlans` | `GET v1/subscriptions/plans` | API key |
| `subscriptions` | `updatePlan` | `PATCH v1/subscriptions/plans/{id}` | JWT |
| `subscriptions` | `createPayment` | `POST v1/subscriptions` | API key & JWT |
| `subscriptions` | `listPayments` | `GET v1/subscriptions` | API key |
| `subscriptions` | `getPayment` | `GET v1/subscriptions/{id}` | API key |
| `subscriptions` | `cancelPayment` | `DELETE v1/subscriptions/{id}` | JWT |

## License

ISC
