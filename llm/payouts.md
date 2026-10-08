# Payouts Resource (`client.payouts`)

Crypto payout (withdrawal) endpoints.

| Method | Endpoint | Auth |
|--------|----------|------|
| `create(payload)` | `POST /v1/payout` | JWT + API key |
| `list(params?)` | `GET /v1/payout` | API key |
| `get(id)` | `GET /v1/payout/{id}` | API key |
| `verifyBatchWithdrawal(id, payload)` | `POST /v1/payout/:batch-withdrawal-id/verify` | JWT + API key |
| `getMinWithdrawalAmount(coin)` | `GET /v1/payout-withdrawal/min-amount/:coin` | API key |
| `getFee(params?)` | `GET /v1/payout/fee` | API key |
| `cancel(id)` | `POST /v1/payout/:payout_id/cancel` | JWT |
| `cancelBatch(batchId)` | `POST /v1/payout/:batch_id/cancel-batch` | JWT |

> Payouts can only be requested from a **whitelisted IP** to **whitelisted wallet addresses** (enabled by default per partner account).

## `payouts.create(payload)`

Create one or more crypto payouts. Requires a JWT.

```ts
const jwtClient = client.withJwt(token);

const payout = await jwtClient.payouts.create({
  ipn_callback_url: "https://example.com/ipn",
  withdrawals: [
    {
      address: "0xabc...",
      currency: "eth",
      amount: 10,
      fiat_amount: 100,        // optional
      fiat_currency: "usd",    // optional
      ipn_callback_url: "https://example.com/ipn", // optional, per withdrawal
    },
  ],
});
// => { id, withdrawals: [{ id, address, currency, amount, status, batch_withdrawal_id, ... }] }
```

**Payload:** `Payout.CreatePayload`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `withdrawals` | `array` | yes | List of withdrawals |
| `withdrawals[].address` | `string` | yes | Destination wallet |
| `withdrawals[].currency` | `string` | yes | Crypto ticker |
| `withdrawals[].amount` | `string \| number` | yes | Crypto amount |
| `withdrawals[].fiat_amount` / `fiat_currency` | `number` / `string` | no | Fiat equivalent |
| `ipn_callback_url` | `string` | no | Webhook URL |

**Response:** `Payout.CreateResponse { id: string; withdrawals: Withdrawal[] }` —
`Withdrawal.status`: `CREATING | WAITING | PROCESSING | SENDING | FINISHED | FAILED | REJECTED`.

## `payouts.list(params?)`

List your payouts with filters.

```ts
const { data, limit, page, pagesCount, total } = await client.payouts.list({
  limit: 10,
  page: 0,
  status: "FINISHED",
  batch_id: "batch-id",
  order_by: "dateCreated",
  order: "desc",
  date_from: "2026-01-01",
  date_to: "2026-02-01",
});
// => { data: Payout[], limit, page, pagesCount, total }
```

**Params:** `Payout.ListParams` — optional `batch_id`, `status`,
`order_by` (`id | batchId | dateCreated | dateRequested | dateUpdated | currency | status`),
`order` (`asc|desc`), `date_from`, `date_to`, `limit`, `page`.

## `payouts.get(id)`

Get a single payout by id.

```ts
const payout = await client.payouts.get(payoutId);
// => { id, amount, currency, address, status, txHash, createdAt, updatedAt, ... }
```

**Response:** `Payout.Payout`

## `payouts.verifyBatchWithdrawal(batchWithdrawalId, payload)`

Verify a payout batch with your 2FA code (Google Auth or email).
You have **10 attempts**; after that the payout stays in `creating` status.
The payout is processed only after verification.

```ts
const { result } = await jwtClient.payouts.verifyBatchWithdrawal(
  "batch-withdrawal-id",
  { verification_code: "123456" },
);
// => { result: "..." }
```

**Payload:** `{ verification_code: string }`
**Response:** `{ result: string }`

## `payouts.getMinWithdrawalAmount(coin)`

Minimum withdrawal amount for a coin.

```ts
const { success, result } = await client.payouts.getMinWithdrawalAmount("btc");
// => { success: true, result: 0.0005 }
```

**Response:** `{ success: boolean; result: number }`

## `payouts.getFee(params?)`

Estimated network fee for a payout.

```ts
const { currency, fee } = await client.payouts.getFee({
  currency: "btc",
  amount: 1,
});
// => { currency: "btc", fee: 0.0001 }
```

**Params:** `{ currency: string; amount: number }`
**Response:** `Payout.FeeResponse { currency: string; fee: number }`

## `payouts.cancel(id)`

Cancel a scheduled/recurring payout created with `execute_at`.
Only advance-scheduled payouts can be canceled; status becomes `cancelled`.

```ts
await jwtClient.payouts.cancel(payoutId); // returns void
```

## `payouts.cancelBatch(batchId)`

Cancel an entire recurring payout batch.

```ts
await jwtClient.payouts.cancelBatch("batch-id"); // returns void
```
