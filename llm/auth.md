# Auth Resource (`client.auth`)

Authentication & API status endpoints.

| Method | Endpoint | Auth |
|--------|----------|------|
| `status()` | `GET /v1/status` | none |
| `token(payload)` | `POST /v1/auth` | none |

## `auth.status()`

Health check — returns `"OK"` when the API is available. No credentials required.

```ts
const status = await client.auth.status();
// => { message: "OK" }
```

**Response:** `ApiStatus { message: string }`

## `auth.token(payload)`

Exchange your dashboard email/password for a JWT bearer token.
The JWT is required for payouts, customers, subscriptions and conversions endpoints.
**JWT tokens expire in 5 minutes** — fetch a fresh one when needed.

```ts
const { token } = await client.auth.token({
  email: "you@example.com",
  password: "your-password",
});

// Use the JWT for subsequent calls
const jwtClient = client.withJwt(token);
await jwtClient.payouts.create({ /* ... */ });
```

**Payload:** `AuthPayload { email: string; password: string }`
**Response:** `JwtToken { token: string }`

## Cloudflare Workers — token caching (4-minute expiry)

JWT hard-expires after **5 minutes**, so cache it for **4 minutes** and
refresh before it dies. In a Worker, keep the token in module-level memory
(per isolate) and reuse it while >1 minute of life remains.

```ts
// worker.ts
import { NowPayments } from "nowpayments-native";

interface Env {
  NOWPAYMENTS_API_KEY: string;
  NOWPAYMENTS_EMAIL: string;
  NOWPAYMENTS_PASSWORD: string;
}

// In-memory cache — lives as long as the Worker isolate
let cached: { token: string; expiresAt: number } | null = null;

const TOKEN_TTL_MS = 4 * 60 * 1000; // 4 minutes (JWT expires at 5)

async function getJwt(env: Env): Promise<string> {
  const now = Date.now();

  // Reuse cached token while more than 1 minute remains
  if (cached && cached.expiresAt - now > 60_000) {
    return cached.token;
  }

  const authClient = new NowPayments({ apiKey: env.NOWPAYMENTS_API_KEY });
  const { token } = await authClient.auth.token({
    email: env.NOWPAYMENTS_EMAIL,
    password: env.NOWPAYMENTS_PASSWORD,
  });

  cached = { token, expiresAt: now + TOKEN_TTL_MS };
  return token;
}

export default {
  async fetch(request: Request, env: Env) {
    const token = await getJwt(env);
    const jwtClient = new NowPayments({
      apiKey: env.NOWPAYMENTS_API_KEY,
    }).withJwt(token);

    // Example: list payouts with the cached JWT
    const payouts = await jwtClient.payouts.list({ limit: 10, page: 0 });
    return Response.json(payouts);
  },
};
```

**Notes:**

- `Date.now()` in Workers is wall-clock — safe for TTL checks.
- Module-level cache is per-isolate; concurrent cold starts may each fetch a
  token (cheap, but add a promise lock if you need exactly-once refresh):

```ts
let refreshPromise: Promise<string> | null = null;

async function getJwt(env: Env): Promise<string> {
  const now = Date.now();
  if (cached && cached.expiresAt - now > 60_000) return cached.token;

  // Single-flight: concurrent requests share one refresh
  refreshPromise ??= (async () => {
    const authClient = new NowPayments({ apiKey: env.NOWPAYMENTS_API_KEY });
    const { token } = await authClient.auth.token({
      email: env.NOWPAYMENTS_EMAIL,
      password: env.NOWPAYMENTS_PASSWORD,
    });
    cached = { token, expiresAt: Date.now() + TOKEN_TTL_MS };
    return token;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}
```

- For multi-isolate sharing, store `{ token, expiresAt }` in **Workers KV**
  with `expirationTtl: 240` instead of module memory (accepting KV's
  eventual consistency).
- Always call `client.withJwt(token)` — never mutate the base client.

