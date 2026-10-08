# Currencies Resource (`client.currencies`)

Currency listing & detail endpoints. All methods require an **API key**.

| Method | Endpoint | Auth |
|--------|----------|------|
| `list(params?)` | `GET /v1/currencies` | API key |
| `full()` | `GET /v1/full-currencies` | API key |
| `checked()` | `GET /v1/merchant/coins` | API key |

## `currencies.list(params?)`

List all cryptocurrency tickers available for payments in your setup.

```ts
const { currencies } = await client.currencies.list();
// => { currencies: ["btc", "eth", "usdttrc20", ...] }

// Only fixed-rate currencies (response includes min/max exchange amounts)
const fixed = await client.currencies.list({ fixed_rate: true });
```

**Params:** `Currencies.ListParams { fixed_rate?: boolean }`
**Response:** `{ currencies: string[] }`

## `currencies.full()`

Detailed info for every currency: name, logo, network, wallet regex, precision, flags.

```ts
const { currencies } = await client.currencies.full();
// => { currencies: [{ id, code, name, enable, wallet_regex, priority,
//                     extra_id_exists, logo_url, network, smart_contract,
//                     network_precision, precision, ticker, is_defi,
//                     is_stable, is_popular, available_for_payment,
//                     available_for_payout, ... }] }

// Find a currency's wallet validation regex
const btc = currencies.find((c) => c.code === "btc");
console.log(btc?.wallet_regex);
```

**Response:** `{ currencies: FullCurrency[] }`

## `currencies.checked()`

Currencies you enabled in the "Coins Settings" tab of your merchant account.

```ts
const { selectedCurrencies } = await client.currencies.checked();
// => { selectedCurrencies: ["btc", "eth", "usdttrc20", ...] }
```

**Response:** `{ selectedCurrencies: string[] }`
