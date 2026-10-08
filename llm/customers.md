# Customers Resource (`client.customers`)

Customer management (sub-partner) endpoints for custody accounts.

| Method | Endpoint | Auth |
|--------|----------|------|
| `balance(customerId)` | `GET /v1/sub-partner/balance/:id` | API key |
| `list(params?)` | `GET /v1/sub-partner` | JWT |
| `create(payload)` | `POST /v1/sub-partner/balance` | JWT |
| `createPayment(payload)` | `POST /v1/sub-partner/payment` | JWT + API key |
| `listPayments(params?)` | `GET /v1/sub-partner/payments` | JWT |
| `createDeposits(payload)` | `POST /v1/sub-partner/deposit` | JWT + API key |
| `createTransfers(params)` | `POST /v1/sub-partner/transfer` | JWT |
| `listTransfers(params?)` | `GET /v1/sub-partner/transfers` | JWT |
| `getTransfer(transferId)` | `GET /v1/sub-partner/transfer/:id` | JWT |
| `createWriteOff(payload)` | `POST /v1/sub-partner/write-off` | JWT |

> `balance()` can only be called from a **whitelisted IP** (unless IP whitelisting is disabled).

## `customers.balance(customerId)`

Get a customer's balance per currency.

```ts
const { result } = await client.customers.balance("111394288");
// => { result: { subPartnerId, balances: { usdttrc20: { amount, pendingAmount }, ... } } }
```

**Response:** `{ result: Customer.Balance }`

## `customers.list(params?)`

List all your customers.

```ts
const jwtClient = client.withJwt(token);

const { result, count } = await jwtClient.customers.list({
  id: "111394288",
  offset: 0,
  limit: 10,
  order: "DESC",
});
// => { result: [{ id, name, created_at, updated_at }], count }
```

**Params:** `{ id?: string; offset?: number; limit?: number; order?: "ASC" | "DESC" }`

## `customers.create(payload)`

Create a customer account. Afterwards you can generate payments
(`createPayment`) or deposits (`createDeposits`) to top up its balance,
and withdraw funds from it.

```ts
const { result } = await jwtClient.customers.create({
  name: "new_customer",
});
// => { result: { id, name, created_at, updated_at } }
```

**Payload:** `{ name: string }`
**Response:** `{ result: Customer.Customer }`

## `customers.createPayment(payload)`

Create a general payment for a customer to top up their balance.
Check the payment status via `payments.get`.

```ts
const { result } = await jwtClient.customers.createPayment({
  currency: "usdttrc20",
  amount: 50,
  sub_partner_id: "111394288",
  is_fixed_rate: true,
  is_fee_paid_by_user: false,
  ipn_callback_url: "https://example.com/ipn",
});
// => { result: { payment_id, payment_status, pay_address, pay_amount, ... } }
```

**Payload:** `Customer.CreatePaymentPayload`

| Field | Type | Required |
|-------|------|----------|
| `currency` | `string` | yes |
| `amount` | `number` | yes |
| `sub_partner_id` | `string` | yes |
| `is_fixed_rate` | `boolean` | yes |
| `is_fee_paid_by_user` | `boolean` | yes |
| `ipn_callback_url` | `string` | yes |

## `customers.listPayments(params?)`

List payments generated for a particular customer.

```ts
const { result, count } = await jwtClient.customers.listPayments({
  limit: 10,
  page: 0,
  sub_partner_id: "111394288",
  status: "finished",
  pay_currency: "usdttrc20",
  date_from: "2026-01-01",
  date_to: "2026-02-01",
  sortBy: "created_at",
  orderBy: "desc",
});
// => { result: Payment[], count }
```

**Params:** `Customer.ListPaymentsParams` — `limit` (required), optional
`page`, `id`, `pay_currency`, `status`, `sub_partner_id`, `date_from`,
`date_to`, `orderBy` (`asc|desc`), `sortBy` (`id | status | pay_currency | created_at | updated_at`).

## `customers.createDeposits(payload)`

Deposit funds from your master account to a customer.

```ts
const { result } = await jwtClient.customers.createDeposits({
  currency: "usdttrc20",
  amount: 10,
  sub_partner_id: "111394288",
});
// => { result: Deposit }
```

**Payload:** `{ currency: string; amount: number; sub_partner_id: string }`

## `customers.createTransfers(params)`

Transfer funds between two customer accounts. Check the transfer status
via `getTransfer`.

```ts
const { result } = await jwtClient.customers.createTransfers({
  from_id: "111394288",
  to_id: "111394289",
  amount: "5",
  currency: "usdttrc20",
});
// => { result: { id, from_sub_id, to_sub_id, status, amount, currency, ... } }
```

**Payload:** `Customer.TransferPayload` — `from_id`, `to_id`, `amount`, `currency` (all required).

## `customers.listTransfers(params?)`

List all transfers created by your customers.

```ts
const { result, count } = await jwtClient.customers.listTransfers({
  id: 123,           // or [123, 456]
  status: "FINISHED", // required: WAITING | CREATED | FINISHED | REJECTED
  limit: 10,          // required
  offset: 0,          // required
  order: "DESC",
});
// => { result: Transfer[], count }
```

**Params:** `ListTransfersParams` — `status`, `limit`, `offset` required;
optional `id` (number or array), `order` (`ASC|DESC`).

## `customers.getTransfer(transferId)`

Get a single transfer by id.

```ts
const { result } = await jwtClient.customers.getTransfer(transfer.id);
// => { result: { id, from_sub_id, to_sub_id, status, created_at, updated_at, amount, currency } }
```

**Response:** `{ result: Customer.Transfer }`

## `customers.createWriteOff(payload)`

Withdraw funds from a customer's account to your master account.

```ts
const { result } = await jwtClient.customers.createWriteOff({
  currency: "usdttrc20",
  amount: 5,
  sub_partner_id: "111394288",
});
// => { result: { id, from_sub_id, to_sub_id, status, amount, currency, destination, type, ... } }
```

**Payload:** `{ currency: string; amount: number; sub_partner_id: string }`
