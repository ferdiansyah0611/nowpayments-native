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
- 🔄 **JWT support** — obtain JWT via `/auth` for payouts and customer endpoints.
- 💳 **Sub-partner management** — customer accounts, deposits, transfers, and recurring payments.
- 📊 **Conversion rates** — real-time currency conversion estimates.
- 📝 **IPN verification** — HMAC-SHA512 signature verification for webhooks.

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
const estimate = await client.conversions.estimate({
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

// Get minimum withdrawal amount
const minWithdrawal = await client.payouts.getMinWithdrawalAmount("btc");

// Get withdrawal fee
const fee = await client.payouts.getFee({
  currency_from: "btc",
  currency_to: "usd",
});

// Create a payout (requires JWT)
const jwtClient = client.withJwt(token);
const payout = await jwtClient.payouts.create({
  address: "0xabc...",
  currency: "eth",
  amount: 10,
});

// List payouts (requires JWT)
const payouts = await jwtClient.payouts.list({ limit: 10, page: 0 });

// Get a single payout
const fetchedPayout = await jwtClient.payouts.get(payout.id);

// Verify batch withdrawal (requires JWT)
const verified = await jwtClient.payouts.verifyBatchWithdrawal(batchId, {
  code: "123456",
});

// Cancel a payout (requires JWT)
await jwtClient.payouts.cancel(payout.id);

// Customer management (sub-partners)
// Get a customer's balance (API key)
const { result: customerBalance } = await client.customers.balance("111394288");
// => { subPartnerId, balances: { usdttrc20: { amount, pendingAmount }, ... } }

// List customers (JWT required)
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

// List customer payments (JWT required)
const { result: payments, count } = await jwtClient.customers.listPayments({
  limit: 10,
  offset: 0,
});

// Create deposits for a customer (JWT required)
const { result: deposit } = await jwtClient.customers.createDeposits({
  customer_id: "111394288",
  amount: "10",
  currency: "usdttrc20",
});

// Create transfers between users (JWT required)
const { result: transfer } = await jwtClient.customers.createTransfers({
  customer_id: "111394288",
  amount: "5",
  currency: "usdttrc20",
});

// List transfers (JWT required)
const { result: transfers } = await jwtClient.customers.listTransfers({
  limit: 10,
  offset: 0,
});

// Get transfer details (JWT required)
const { result: transferDetails } = await jwtClient.customers.getTransfer(transfer.id);

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

Most endpoints require an API key (passed in the `x-api-key` header). Payouts, customer management, and subscription endpoints require a JWT bearer token obtained via `POST /v1/auth`:

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
await jwtClient.customers.list({ /* ... */ });
await jwtClient.subscriptions.create({ /* ... */ });
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
| `auth`        | `token`       | `POST /v1/auth`           | none     |
| `currencies`  | `list`        | `GET /v1/currencies`      | API key  |
| `currencies`  | `full`        | `GET /v1/full-currencies` | API key  |
| `currencies`  | `checked`     | `GET /v1/merchant/coins`  | API key  |
| `currencies`  | `minimumAmount` | `GET /v1/min-amount`    | API key  |
| `conversions` | `estimate`    | `GET /v1/estimate`        | API key  |
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
| `customers`   | `listPayments` | `GET /v1/sub-partner/payments` | JWT |
| `customers`   | `createDeposits` | `POST /v1/sub-partner/deposit` | JWT |
| `customers`   | `createTransfers` | `POST /v1/sub-partner/transfer` | JWT |
| `customers`   | `listTransfers` | `GET /v1/sub-partner/transfers` | JWT |
| `customers`   | `getTransfer` | `GET /v1/sub-partner/transfer/{id}` | JWT |
| `subscriptions` | `getPlan` | `GET v1/subscriptions/plans/{id}` | API key |
| `subscriptions` | `getAllPlans` | `GET v1/subscriptions/plans` | API key |
| `subscriptions` | `updatePlan` | `PATCH v1/subscriptions/plans/{id}` | JWT |
| `subscriptions` | `createPayment` | `POST v1/subscriptions` | API key & JWT |
| `subscriptions` | `listPayments` | `GET v1/subscriptions` | API key |
| `subscriptions` | `getPayment` | `GET v1/subscriptions/{id}` | API key |
| `subscriptions` | `cancelPayment` | `POST v1/subscriptions/{id}` | JWT |

## Developer

### Project Structure

```
nowpayments-native/
├── src/
│   ├── client.ts              # Main client class
│   ├── http.ts                # HTTP client implementation
│   ├── errors.ts              # Error classes
│   ├── ipn.ts                 # IPN signature verification
│   ├── resources/             # API resource classes
│   │   ├── auth.ts            # Authentication endpoints
│   │   ├── currencies.ts      # Currency endpoints
│   │   ├── conversions.ts     # Conversion endpoints
│   │   ├── payments.ts        # Payment endpoints
│   │   ├── payouts.ts         # Payout endpoints
│   │   ├── customers.ts       # Customer/sub-partner endpoints
│   │   ├── subscriptions.ts   # Subscription endpoints
│   │   └── main.ts            # Base Resource class
│   └── types/                 # TypeScript type definitions
│       ├── main.types.ts      # Main types
│       ├── payments.types.ts  # Payment types
│       ├── payouts.types.ts   # Payout types
│       ├── customers.types.ts # Customer types
│       └── subscriptions.types.ts # Subscription types
├── test/                      # Test files
│   ├── resources/             # Resource-specific tests
│   ├── e2e/                   # End-to-end tests
│   └── utils.ts               # Test utilities
├── dist/                      # Compiled output
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

### Development Setup

```bash
# Clone the repository
git clone <repository-url>
cd nowpayments-native

# Install dependencies
npm install

# Build the project	npm run build

# Run type checking
npm run types

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run resource-specific tests
npm run test:resources

# Run E2E tests
npm run test:e2e
```

### Testing

The project uses [Vitest](https://vitest.dev/) for testing.

**Test Structure:**
- `test/resources/` — Tests for individual API resources
- `test/e2e/` — End-to-end integration tests
- `test/utils.ts` — Shared test utilities

**Running Tests:**
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test test/resources/payments.test.ts

# Run with coverage
npm test -- --coverage
```

### Adding New Endpoints

1. **Define types** in `src/types/`:
   ```typescript
   // src/types/new-resource.types.ts
   export interface NewResource {
     id: string;
     name: string;
   }

   export interface NewResourceCreatePayload {
     name: string;
   }
   ```

2. **Create resource class** in `src/resources/`:
   ```typescript
   // src/resources/new-resource.ts
   import type { RequestOptions } from "../http.js";
   import type { NewResource } from "../types/new-resource.types.js";
   import { Resource } from "./main.js";

   export class NewResource extends Resource {
     create(payload: NewResourceCreatePayload, options?: RequestOptions): Promise<NewResource> {
       return this.http.post<NewResource>(
         "/v1/new-resource",
         payload as unknown as Record<string, unknown>,
         options,
       );
     }
   }
   ```

3. **Register resource** in `src/resources/index.ts`:
   ```typescript
   export { NewResource } from "./new-resource.js";
   ```

4. **Export from client** in `src/client.ts`:
   ```typescript
   import { NewResource } from "./resources/index.js";

   export class NowPayments {
     public readonly newResource: NewResource;

     constructor(options: NowPaymentsOptions = {}) {
       // ...
       this.newResource = new NewResource(this.http);
     }
   }
   ```

5. **Add tests** in `test/resources/new-resource.test.ts`:
   ```typescript
   import { describe, it, expect, beforeEach } from "vitest";
   import { NewResource } from "../src/resources/new-resource.js";

   describe("NewResource", () => {
     let resource: NewResource;

     beforeEach(() => {
       resource = new NewResource(mockHttpClient);
     });

     it("should create a new resource", async () => {
       const result = await resource.create({ name: "test" });
       expect(result.name).toBe("test");
     });
   });
   ```

### Code Style

- **TypeScript**: Strict mode enabled
- **Formatting**: Use Prettier (if available)
- **Linting**: ESLint configured in `eslint.config.js`
- **Naming**: PascalCase for classes, camelCase for methods
- **Comments**: JSDoc for public APIs

### Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### API Documentation

The API documentation is maintained in the [official NowPayments documentation](https://documenter.getpostman.com/view/7907941/2s93JusNJt).

When adding new endpoints:
1. Verify against the official API documentation
2. Update the API surface table in README.md
3. Add examples to the Usage section
4. Ensure all types are properly defined

### Debugging

Enable debug logging by passing a custom `fetchImpl`:

```typescript
import { NowPayments } from "nowpayments-native";

const client = new NowPayments({
  apiKey: process.env.NOWPAYMENTS_API_KEY!,
  fetchImpl: async (input, init) => {
    console.log("Request:", input, init);
    const response = await fetch(input, init);
    console.log("Response:", response.status, response.statusText);
    return response;
  },
});
```

### Release Process

```bash
# Bump version in package.json
npm version patch/minor/major

# Build and test
npm run build
npm test

# Publish to npm
npm publish
```

### Environment Variables

For development and testing, you may need to set up environment variables:

```bash
# .env file
VITE_NOWPAYMENTS_API_KEY=
VITE_NOWPAYMENTS_PUBLIC_KEY=
VITE_NOWPAYMENTS_IPN=
VITE_NOWPAYMENTS_ACC_EMAIL=
VITE_NOWPAYMENTS_ACC_PASS=
VITE_NOWPAYMENTS_CUSTOMERID=
VITE_NOWPAYMENTS_SUBSCRIBE_PLANID=
```

### TypeScript Configuration

The project uses TypeScript with strict mode enabled. Key configuration in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022"],
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

### Best Practices

1. **Type Safety**: Always use TypeScript types. Avoid `any` types.
2. **Error Handling**: Always handle `NowPaymentsError` and `NowPaymentsAbortError`.
3. **Testing**: Write tests for all new endpoints.
4. **Documentation**: Update README.md when adding new features.
5. **Edge Runtime Compatibility**: Ensure code works in edge environments (Cloudflare Workers, Vercel Edge, Deno, Bun).
6. **No Node Built-ins**: Avoid using Node.js specific APIs. Use platform `fetch` instead.
7. **JWT Management**: JWT tokens expire in 5 minutes. Handle token refresh appropriately.
8. **IPN Verification**: Always verify webhook signatures before processing.
9. **Pagination**: Handle paginated responses correctly using `limit` and `page` parameters.
10. **Timeouts**: Use configurable timeouts for API calls.

### Common Issues

**JWT Token Expiration**:
JWT tokens expire in 5 minutes. For long-running operations, obtain a new token before it expires.

**IPN Signature Verification**:
Ensure you're using the correct secret key and that the signature is calculated with keys sorted recursively.

**Edge Runtime Compatibility**:
Some Node.js APIs are not available in edge runtimes. Use platform `fetch` instead of `node-fetch`.

**TypeScript Module Resolution**:
The project uses ES modules. Ensure your bundler is configured correctly for ES module resolution.

### Performance Considerations

1. **Reuse Client Instances**: Create a single `NowPayments` client instance and reuse it.
2. **Batch Operations**: Use batch endpoints when available to reduce API calls.
3. **Pagination**: Use pagination to avoid loading large datasets at once.
4. **Caching**: Cache frequently accessed data like currency lists.
5. **Timeouts**: Set appropriate timeouts for API calls to avoid hanging requests.

### Security Considerations

1. **API Key Security**: Never commit API keys to version control.
2. **JWT Token Security**: Store JWT tokens securely and handle expiration.
3. **IPN Verification**: Always verify webhook signatures before processing.
4. **Input Validation**: Validate all input parameters before making API calls.
5. **Error Messages**: Don't expose sensitive information in error messages.

## License

ISC
