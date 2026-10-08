# Zod Validation (`src/validation/zod`)

Zod schemas for every NowPayments resource — validate request
payloads before sending and parse/validate API responses.

Requires `zod` (v4) as a dependency:

```bash
npm install zod
```

```ts
import {
  paymentCreatePayloadSchema,
  paymentSchema,
  authPayloadSchema,
  // ... other schemas
} from "nowpayments-native/validation/zod";
// or relative import in this repo:
// from "../src/validation/zod/index.js"
```

## Conventions

| Schema kind | Zod object | Behavior |
|-------------|------------|----------|
| **Request payloads** (`*PayloadSchema`, `*ParamsSchema`) | `z.strictObject()` | Unknown keys **throw** — typos fail fast |
| **Response records** (`*Schema`, `*ResponseSchema`) | `z.looseObject()` | Unknown keys **kept** — API can add fields safely |

Every schema also exports an inferred TS type:

```ts
import type { PaymentCreatePayloadInput, PaymentOutput } from ".../zod";
```

Naming: `{resource}{Thing}Schema` for schemas,
`{Thing}Input` for request types, `{Thing}Output` for response types.

## Basic usage

### Validate a request payload (fail fast)

```ts
import { paymentCreatePayloadSchema } from "./validation/zod/index.js";

const payload = paymentCreatePayloadSchema.parse({
  price_amount: 10,
  price_currency: "usd",
  pay_currency: "btc",
  order_id: "order-123",
});
// throws ZodError if invalid (e.g. missing price_amount)

const payment = await client.payments.create(payload);
```

### Validate a response

```ts
import { paymentSchema } from "./validation/zod/index.js";

const raw = await client.payments.get(paymentId);
const payment = paymentSchema.parse(raw); // typed + validated
```

### Non-throwing validation (recommended at boundaries)

```ts
import { paymentCreatePayloadSchema } from "./validation/zod/index.js";

const result = paymentCreatePayloadSchema.safeParse(input);
if (!result.success) {
  // result.error.issues: [{ path, message, code }, ...]
  console.error(result.error.issues);
  return;
}
await client.payments.create(result.data);
```

### Error handling

```ts
import { ZodError } from "zod";

try {
  paymentCreatePayloadSchema.parse(input);
} catch (err) {
  if (err instanceof ZodError) {
    for (const issue of err.issues) {
      console.error(issue.path.join("."), issue.message);
    }
  }
}
```

## Resource schema reference

### `auth` — `auth.schema.ts`

| Schema | Use |
|--------|-----|
| `authPayloadSchema` | `POST /v1/auth` body (`email` must be valid email) |
| `apiStatusSchema` | `GET /v1/status` response |
| `jwtTokenSchema` | `POST /v1/auth` response (`token` non-empty) |

```ts
const creds = authPayloadSchema.parse({
  email: "you@example.com",
  password: "secret",
});
const { token } = await client.auth.token(creds);
```

### `currencies` — `currencies.schema.ts`

| Schema | Use |
|--------|-----|
| `currenciesListParamsSchema` | `GET /v1/currencies` (`fixed_rate?: boolean`) |
| `currenciesListResponseSchema` | `{ currencies: string[] }` |
| `fullCurrencySchema` | Single currency detail record |
| `fullCurrenciesResponseSchema` | `GET /v1/full-currencies` response |
| `currenciesCheckedResponseSchema` | `GET /v1/merchant/coins` response |

```ts
const params = currenciesListParamsSchema.parse({ fixed_rate: true });
const { currencies } = currenciesListResponseSchema.parse(
  await client.currencies.list(params),
);
```

### `conversions` — `conversions.schema.ts`

| Schema | Use |
|--------|-----|
| `conversionCreatePayloadSchema` | `POST v1/conversion` (`amount`, `from_currency`, `to_currency`) |
| `conversionSchema` | Single conversion record (`status` enum) |
| `conversionResponseSchema` | `{ result: Conversion }` |
| `conversionListParamsSchema` | Filters: `id`, `status`, currencies, date range, `limit`, `offset`, `order` |
| `conversionListResponseSchema` | `{ result: Conversion[], count }` |

```ts
const payload = conversionCreatePayloadSchema.parse({
  amount: 100,
  from_currency: "usdttrc20",
  to_currency: "btc",
});
const { result } = conversionResponseSchema.parse(
  await jwtClient.conversions.create(payload),
);
```

### `payments` — `payments.schema.ts`

| Schema | Use |
|--------|-----|
| `paymentCreatePayloadSchema` | `POST /v1/payment` (`price_amount`, `price_currency`, `pay_currency` required) |
| `paymentSchema` | Payment record (`payment_status` enum validated) |
| `paymentListParamsSchema` | `GET /v1/payment` (`limit` 1–500, `page` ≥ 0, `sortBy`, `orderBy` enums) |
| `paymentListResponseSchema` | Paginated `{ data, limit, page, pagesCount, total }` |
| `invoiceCreatePayloadSchema` | `POST /v1/invoice` |
| `invoiceSchema` | Invoice record |
| `accountBalanceResponseSchema` | `GET /v1/balance` — `Record<ticker, { amount, pendingAmount }>` |
| `validateAddressPayloadSchema` | `POST /v1/payout/validate-address` |
| `validateAddressResponseSchema` | `{ status, statusCode?, message? }` |

```ts
const payload = paymentCreatePayloadSchema.parse({
  price_amount: 10,
  price_currency: "usd",
  pay_currency: "btc",
  ipn_callback_url: "https://example.com/ipn",
});
const payment = paymentSchema.parse(await client.payments.create(payload));
console.log(payment.payment_id, payment.payment_status);
```

### `payouts` — `payouts.schema.ts`

| Schema | Use |
|--------|-----|
| `payoutCreatePayloadSchema` | `POST /v1/payout` — `withdrawals` array `.min(1)` |
| `withdrawalSchema` | Withdrawal record inside batch response |
| `payoutCreateResponseSchema` | `{ id, withdrawals }` |
| `payoutSchema` | Payout record |
| `payoutListParamsSchema` | Filters: `batch_id`, `status`, `order_by`, `order`, dates, `limit`, `page` |
| `payoutListResponseSchema` | Paginated list |
| `verifyBatchWithdrawalPayloadSchema` | `{ verification_code }` (2FA) |
| `minWithdrawalAmountResponseSchema` | `{ success, result }` |
| `payoutFeeParamsSchema` | `{ currency, amount }` |
| `payoutFeeResponseSchema` | `{ currency, fee }` |

```ts
const payload = payoutCreatePayloadSchema.parse({
  withdrawals: [
    { address: "0xabc...", currency: "eth", amount: 10 },
  ],
});
const payout = payoutCreateResponseSchema.parse(
  await jwtClient.payouts.create(payload),
);

// Verify with 2FA code
const verified = verifyBatchWithdrawalResponseSchema.parse(
  await jwtClient.payouts.verifyBatchWithdrawal(
    payout.withdrawals[0]!.batch_withdrawal_id,
    { verification_code: "123456" },
  ),
);
```

### `customers` — `customers.schema.ts`

| Schema | Use |
|--------|-----|
| `customerBalanceResponseSchema` | `GET /v1/sub-partner/balance/:id` |
| `customerSchema` | Customer record |
| `customerListParamsSchema` | `{ id?, offset?, limit?, order? }` |
| `customerCreatePayloadSchema` | `POST /v1/sub-partner/balance` — `{ name }` |
| `customerCreatePaymentPayloadSchema` | `POST /v1/sub-partner/payment` (all fields required) |
| `customerPaymentSchema` | Customer payment record |
| `customerListPaymentsParamsSchema` | `limit` required; filters + `sortBy`/`orderBy` enums |
| `customerDepositPayloadSchema` | `POST /v1/sub-partner/deposit` |
| `customerDepositSchema` | Deposit record |
| `customerTransferPayloadSchema` | `POST /v1/sub-partner/transfer` — `{ from_id, to_id, amount, currency }` |
| `customerTransferSchema` | Transfer record |
| `customerListTransfersParamsSchema` | `status`, `limit`, `offset` required |
| `customerWriteOffPayloadSchema` | `POST /v1/sub-partner/write-off` |
| `customerWriteOffCreateResponseSchema` | Transfer/write-off creation response |

```ts
const payload = customerCreatePaymentPayloadSchema.parse({
  currency: "usdttrc20",
  amount: 50,
  sub_partner_id: "111394288",
  is_fixed_rate: true,
  is_fee_paid_by_user: false,
  ipn_callback_url: "https://example.com/ipn",
});
const { result } = customerCreatePaymentResponseSchema.parse(
  await jwtClient.customers.createPayment(payload),
);
```

### `subscriptions` — `subscriptions.schema.ts`

| Schema | Use |
|--------|-----|
| `subscriptionCreatePlanPayloadSchema` | `POST v1/subscriptions/plans` (`title`, `interval_day`, `amount`, `currency`) |
| `subscriptionPlanSchema` | Plan record (`interval_day` returned as string) |
| `subscriptionListPlansParamsSchema` | `{ limit?, offset? }` |
| `subscriptionUpdatePlanPayloadSchema` | `PATCH v1/subscriptions/plans/:id` — all fields optional |
| `subscriptionCreatePayloadSchema` | `POST v1/subscriptions` — `{ subscription_plan_id, email }` |
| `emailSubscriptionSchema` | Recurring payment record |
| `subscriptionListParamsSchema` | Filters: `status` (`WAITING_PAY`…), `subscription_plan_id`, `is_active` |

```ts
const plan = subscriptionCreatePlanPayloadSchema.parse({
  title: "Monthly Premium",
  interval_day: 30,
  amount: 9.99,
  currency: "usd",
});
const { result: created } = subscriptionPlanResponseSchema.parse(
  await jwtClient.subscriptions.createPlan(plan),
);

const sub = subscriptionCreatePayloadSchema.parse({
  subscription_plan_id: created.id,
  email: "user@example.com",
});
const { result: active } = subscriptionResponseSchema.parse(
  await jwtClient.subscriptions.createPayment(sub),
);
```

## Design notes

- **Request vs response strictness** — payloads reject unknown keys
  (catch typos like `pay_currnecy`); responses tolerate them
  (API evolves independently).
- **Enums everywhere status appears** — invalid statuses fail
  parsing instead of silently flowing through your code.
- **Money as `string | number`** — matches the API, which accepts
  both; normalize to string when displaying.
- **`z.record(z.string(), …)`** — zod v4 requires explicit key
  schema (balance maps, currency maps).
- Schemas are **pure data** — no client dependency, usable in
  Workers, Deno, Bun, tests, or anywhere you handle raw API JSON.
