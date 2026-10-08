# Payments Resource (`client.payments`)

Payment, invoice, balance & address-validation endpoints.

| Method | Endpoint | Auth |
|--------|----------|------|
| `create(payload)` | `POST /v1/payment` | API key |
| `list(params?)` | `GET /v1/payment` | API key + JWT |
| `get(paymentId)` | `GET /v1/payment/{id}` | API key |
| `createInvoice(payload)` | `POST /v1/invoice` | API key |
| `balance()` | `GET /v1/balance` | API key |
| `validateAddress(payload)` | `POST /v1/payout/validate-address` | API key |

## `payments.create(payload)`

Create a payment — the customer pays without leaving your website.

```ts
const payment = await client.payments.create({
  price_amount: 10,
  price_currency: "usd",
  pay_currency: "btc",
  order_id: "order-123",
  order_description: "Apple Macbook Pro 2019 x 1",
  ipn_callback_url: "https://example.com/ipn",
});
// => { payment_id, payment_status: "waiting", pay_address, pay_amount, ... }
```

**Payload:** `Payment.CreatePayload`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `price_amount` | `string \| number` | yes | Fiat price |
| `price_currency` | `string` | yes | Fiat currency (`usd`, `eur`, …) |
| `pay_currency` | `string` | yes | Crypto currency (`btc`, `eth`, …) |
| `pay_amount` | `string \| number` | no | Crypto amount (overrides price calc) |
| `order_id` | `string` | no | Your internal order id |
| `order_description` | `string` | no | Order description |
| `ipn_callback_url` | `string` | no | Webhook URL (must be http/https) |
| `purchase_id` | `string` | no | Create another payment for a purchase |
| `payout_address` / `payout_currency` / `payout_extra_id` | `string` | no | External payout destination |
| `fixed_rate` / `is_fixed_rate` | `boolean` | no | Fixed-rate exchange |
| `is_fee_paid_by_user` | `boolean` | no | Exchange fee paid by user |

**Response:** `Payment.Payment` — key fields: `payment_id`, `payment_status`,
`pay_address`, `pay_amount`, `actually_paid`, `order_id`, `created_at`.

Payment statuses: `waiting | confirming | confirmed | sending | partially_paid | finished | failed | refunded | expired`.

## `payments.list(params?)`

List all transactions created with the API key (requires **JWT**).

```ts
const jwtClient = client.withJwt(token);

const { data, limit, page, pagesCount, total } = await jwtClient.payments.list({
  limit: 10,
  page: 0,
  sortBy: "created_at",
  orderBy: "desc",
  dateFrom: "2026-01-01",
  dateTo: "2026-02-01",
  invoiceId: "invoice-id",
});
// => { data: Payment[], limit, page, pagesCount, total }
```

**Params:** `Payment.ListParams` — `limit` (1–500), `page` (0-indexed),
`sortBy` (e.g. `payment_id`, `payment_status`, `created_at`), `orderBy`
(`asc`/`desc`), plus optional `invoiceId`, `dateFrom`, `dateTo`
(`YYYY-MM-DD` or ISO 8601).

## `payments.get(paymentId)`

Get a single payment by id.

```ts
const payment = await client.payments.get(payment.payment_id);
// or by string id
const payment2 = await client.payments.get("123456");
```

**Response:** `Payment.Payment`

## `payments.createInvoice(payload)`

Create a payment link — the customer opens `invoice_url` to pay.

```ts
const invoice = await client.payments.createInvoice({
  price_amount: 50,
  price_currency: "usd",
  pay_currency: "btc", // optional: omit to let the customer choose
  order_id: "order-456",
  ipn_callback_url: "https://example.com/ipn",
  success_url: "https://example.com/success",
  cancel_url: "https://example.com/cancel",
});
// => { id, invoice_url, order_id, price_amount, ... }

// Send the customer to invoice.invoice_url
console.log(invoice.invoice_url);
```

**Payload:** `Payment.CreateInvoicePayload` — `price_amount` + `price_currency`
required; optional `pay_currency`, `ipn_callback_url`, `order_id`,
`order_description`, `success_url`, `cancel_url`, `is_fixed_rate`,
`is_fee_paid_by_user`.

**Response:** `Payment.Invoice` — key fields: `id`, `invoice_url`,
`order_id`, `price_amount`, `success_url`, `cancel_url`.

## `payments.balance()`

Account balances keyed by currency ticker.

```ts
const balance = await client.payments.balance();
// => { eth: { amount, pendingAmount }, trx: { amount, pendingAmount }, ... }

const ethBalance = balance.eth?.amount;
```

**Response:** `Record<string, { amount: Money; pendingAmount: Money }>`

## `payments.validateAddress(payload)`

Check a payout address is valid before withdrawing.

```ts
const validation = await client.payments.validateAddress({
  address: "0xabc...",
  currency: "eth",
  extra_id: null, // memo/tag when applicable
});
// => { status: true } or { status: false, statusCode, message }
```

**Payload:** `{ address: string; currency: string; extra_id?: string | null }`
**Response:** `{ status: boolean; statusCode?: number; message?: string }`
