# Conversions Resource (`client.conversions`)

Currency conversion endpoints for your custody account.
All methods require a **JWT** (`client.withJwt(token)`).

| Method | Endpoint | Auth |
|--------|----------|------|
| `create(payload)` | `POST v1/conversion` | JWT |
| `get(conversionId)` | `GET v1/conversion/:conversion_id` | JWT |
| `list(params?)` | `GET v1/conversion` | JWT |

## `conversions.create(payload)`

Create a conversion between two currencies in your custody account.

```ts
const jwtClient = client.withJwt(token);

const { result } = await jwtClient.conversions.create({
  amount: 100,
  from_currency: "usdttrc20",
  to_currency: "btc",
});
// => { result: { id, status: "WAITING", from_currency, to_currency,
//                from_amount, to_amount, created_at, updated_at } }
```

**Payload:** `Conversion.CreatePayload`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `amount` | `string \| number` | yes | Amount to convert |
| `from_currency` | `string` | yes | Currency to convert from |
| `to_currency` | `string` | yes | Currency to convert to |

**Response:** `{ result: Conversion }` — `Conversion.status` is `"WAITING" | "PROCESSING" | "FINISHED" | "REJECTED"`.

## `conversions.get(conversionId)`

Check the status of a single conversion.

```ts
const { result } = await jwtClient.conversions.get("conversion-id");
// => { result: { id, status: "FINISHED", ..., to_amount: "0.0023" } }
```

**Response:** `{ result: Conversion }`

## `conversions.list(params?)`

List your conversions with optional filters.

```ts
const { result, count } = await jwtClient.conversions.list({
  status: "FINISHED",            // or array: ["FINISHED", "REJECTED"]
  from_currency: "usdttrc20",
  to_currency: "btc",
  created_at_from: "2026-01-01T00:00:00Z",
  created_at_to: "2026-02-01T00:00:00Z",
  limit: 10,
  offset: 0,
  order: "DESC",
});
// => { result: Conversion[], count: number }
```

**Params:** `Conversion.ListParams`

| Field | Type | Description |
|-------|------|-------------|
| `id` | `number \| number[]` | Filter by conversion id(s) |
| `status` | `Status \| Status[]` | Filter by status |
| `from_currency` / `to_currency` | `string` | Filter by currency |
| `created_at_from` / `created_at_to` | `string` | ISO 8601 date range |
| `limit` | `number` | Results per page (default 10) |
| `offset` | `number` | Page number, 0-indexed (default 0) |
| `order` | `"ASC" \| "DESC"` | Sort direction |
