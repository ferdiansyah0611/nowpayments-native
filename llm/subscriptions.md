# Subscriptions Resource (`client.subscriptions`)

Recurring billing endpoints: **subscription plans** (templates) and
**email subscriptions** (recurring payments sent via email links).

| Method | Endpoint | Auth |
|--------|----------|------|
| `createPlan(payload)` | `POST v1/subscriptions/plans` | JWT |
| `getPlan(id)` | `GET v1/subscriptions/plans/:id` | API key |
| `getAllPlans(params?)` | `GET v1/subscriptions/plans` | API key |
| `updatePlan(id, payload)` | `PATCH v1/subscriptions/plans/:id` | JWT |
| `createPayment(payload)` | `POST v1/subscriptions` | JWT + API key |
| `listPayments(params?)` | `GET v1/subscriptions` | API key |
| `getPayment(id)` | `GET v1/subscriptions/:id` | API key |
| `cancelPayment(id)` | `DELETE v1/subscriptions/:id` | JWT |

## Subscription plans

### `subscriptions.createPlan(payload)`

Create a recurring payment plan. Every plan has a unique id required to
generate separate payments.

```ts
const jwtClient = client.withJwt(token);

const { result } = await jwtClient.subscriptions.createPlan({
  title: "Monthly Premium Plan",
  interval_day: 30,
  amount: 9.99,
  currency: "usd",
  ipn_callback_url: "https://example.com/ipn",
  success_url: "https://example.com/success",
  cancel_url: "https://example.com/cancel",
  partially_paid_url: "https://example.com/underpaid", // optional
});
// => { result: { id, title, interval_day, amount, currency, created_at, updated_at, ... } }
```

**Payload:** `Subscription.CreatePlanPayload`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | `string` | yes | Plan name |
| `interval_day` | `number` | yes | Recurring duration in days |
| `amount` | `number` | yes | Amount charged in fiat |
| `currency` | `string` | yes | Fiat currency ticker |
| `ipn_callback_url` | `string` | no | Webhook URL |
| `success_url` / `cancel_url` / `partially_paid_url` | `string` | no | Redirect URLs |

### `subscriptions.getPlan(id)`

Get a single plan by id.

```ts
const { result } = await client.subscriptions.getPlan("76215585");
// => { result: Plan }
```

### `subscriptions.getAllPlans(params?)`

List all payment plans you created.

```ts
const { result, count } = await client.subscriptions.getAllPlans({
  limit: 10,
  offset: 0,
});
// => { result: Plan[], count }
```

**Params:** `{ limit?: number; offset?: number }`

### `subscriptions.updatePlan(id, payload)`

Update a plan. Changes don't affect users who already paid — they take
effect on the next payment.

```ts
const { result } = await jwtClient.subscriptions.updatePlan("76215585", {
  title: "Monthly Premium Plan — Updated",
  amount: 14.99,
  interval_day: 30,
});
// => { result: Plan }
```

**Payload:** `Subscription.UpdatePlanPayload` — all fields optional.

## Email subscriptions (recurring payments)

### `subscriptions.createPayment(payload)`

Send payment links to your customer via email. A day before the paid
period ends, the customer receives a new letter with a new payment link.

```ts
const { result } = await jwtClient.subscriptions.createPayment({
  subscription_plan_id: "76215585",
  email: "user@example.com",
  sub_partner_id: 111394288, // optional
});
// => { result: { id, subscription_plan_id, is_active, subscriber, expire_date, status, ... } }
```

**Payload:** `Subscription.CreatePayload`

| Field | Type | Required |
|-------|------|----------|
| `subscription_plan_id` | `string \| number` | yes |
| `email` | `string` | yes |
| `sub_partner_id` | `number` | no |

### `subscriptions.listPayments(params?)`

List recurring payments filtered by status and/or plan id.

```ts
const { result, count } = await client.subscriptions.listPayments({
  limit: 10,
  offset: 0,
  status: "PAID",            // WAITING_PAY | PAID | PARTIALLY_PAID | EXPIRED
  subscription_plan_id: "76215585",
  is_active: true,
});
// => { result: EmailSubscription[], count }
```

**Params:** `Subscription.ListParams` — all optional: `limit`, `offset`,
`status`, `subscription_plan_id`, `is_active`.

### `subscriptions.getPayment(id)`

Get a single recurring payment by id.

```ts
const { result } = await client.subscriptions.getPayment("subscription-id");
// => { result: { id, subscription_plan_id, is_active, subscriber, expire_date, status, ... } }
```

### `subscriptions.cancelPayment(id)`

Completely remove a recurring payment from the plan.

```ts
const { result } = await jwtClient.subscriptions.cancelPayment("subscription-id");
// => { result: EmailSubscription }
```
