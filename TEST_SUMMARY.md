# Test Suite Summary

**9 files · 160 tests · all passing**

---

## Coverage (tested modules)

| Module | Statements | Branches | Functions |
|---|---|---|---|
| `lib/api-client.ts` | 97.5% | 94.6% | 90% |
| `lib/driver-metrics.ts` | 97.1% | 87.5% | 94.4% |
| `lib/fleet-metrics.ts` | 90.9% | 74.3% | 81.8% |
| `lib/revenue-metrics.ts` | 91.5% | 80.8% | 93.8% |
| `lib/validation.ts` | ~100% | ~100% | 100% |
| `lib/auth.ts` | 42.9% | 11.1% | 60% |
| `hooks/queries/use-shipments.ts` | 72.7% | 93.3% | 20% |

> Overall project coverage is 15% — low because the config includes all React components, which are out of scope for this test suite. Business logic modules sit at 75–97%.

---

## Test Files

### `auth.test.ts` — 17 tests
- `extractUserInfo`: parses JWT claims, extracts roles from correct Keycloak client, returns empty roles when missing
- `isTokenExpired`: past/future exp, within/outside 30s safety buffer, malformed tokens
- `persistTokens` / `getStoredTokens` / `clearStoredTokens`: localStorage round-trip, nulls when empty, idempotent clear

### `api-client-fetch.test.ts` — 12 tests
- GET/POST/PATCH/PUT/DELETE: correct method, path construction, JSON body, Content-Type header
- Bearer token attached; omitted when token is null
- 204 returns `undefined`; 400/404/500 throw `ApiError` with correct status

### `validation.test.ts` — 48 tests
- `validatePhone`: Ethiopian formats (`09XXXXXXXX`, `+2519XXXXXXXX`), whitespace, required/optional, invalid patterns
- `validateEmail`: valid formats, length limit (>255), missing `@`, spaces
- `validatePassword`: length, uppercase, lowercase, digit, special character requirements
- `validateName`: required/optional, 50-char limit, whitespace trimming
- `validateLicensePlate`: 2–3 letter prefix, hyphen/space separator, lowercase accepted, invalid patterns
- `validateUrl`: http/https, optional/required empty, unsupported protocol

### `fleet-metrics.test.ts` — 13 tests
- Active driver count, `onDelivery` / `idle` split, inactive driver exclusion
- `utilizationRate`, `capacityRisk` thresholds (high ≥0.85, moderate 0.6–0.85, low <0.6)
- 24-hour zero-filled `hourlyActivity`, workload entries, peak hour detection

### `revenue-metrics.test.ts` — 20 tests
- `isShipmentInRange`: boundary conditions, null `delivered_at`
- `formatEtb`: zero, thousands separator, decimals, rounding
- `computeRevenueMetrics`: revenue sum, non-delivered exclusion, `revenueChangePct` vs prior period, daily series zero-fill, correct date slot, top drivers ranked by revenue

### `build-query.test.ts` — 7 tests
- No filters → `"shipments"` (no `?`)
- Each filter param appended correctly (page, status, driver, date range)
- All filters combined; omitted fields absent from output

### `batch-assign.test.ts` — 5 tests
- All succeed → all `{ success: true }`
- Correct API path and `driver_id` payload per shipment
- One failure mid-batch → loop continues, returns mixed results
- All fail → all `{ success: false }` with error strings
- Empty input → no API calls, returns `[]`
