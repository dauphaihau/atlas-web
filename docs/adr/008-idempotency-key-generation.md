# ADR-008: Idempotency Key Generation in the API Layer

## Status

Accepted

## Date

2026-04-27

## Context

The backend requires an `Idempotency-Key` header on two mutating endpoints:

- `POST /api/v1/users/import` — starts an async CSV import job
- `GET /api/v1/users/export` — triggers a synchronous CSV export

Without the header the server returns `422 MISSING_IDEMPOTENCY_KEY`. The header prevents duplicate import jobs and duplicate export files when a client retries due to a network timeout or double-submit.

The key must be a string of 16–255 characters using only `[A-Za-z0-9._:-]`. The server treats it as opaque and scopes uniqueness by `(tenant_id, user_id, endpoint, key)`.

Three places in the client could own key generation:

1. **Component level** — generate when the user clicks the submit button, store in local state, pass through the mutation hook.
2. **Mutation hook level** — generate once when the mutation is created or called, thread through to the API function.
3. **API function level** — generate inside `importUsers()` / `exportUsers()` at call time.

## Options Considered

### Option A: Generate at component level, pass as argument
- Pros: Stable key is available for retry — the same key can be reused if the mutation is retried before the component unmounts; visible in the call chain
- Cons: Every call site must generate and pass a key; changes signatures of `importUsers()`, `exportUsers()`, and the mutation hooks; existing code that calls `userApi.importUsers(file)` must be updated; React Query's automatic retry would still generate a new key per `.mutate()` call unless extra wiring is added

### Option B: Generate in the mutation hook, pass to the API
- Pros: Isolated from component code; the key could theoretically be pinned for the lifetime of the mutation hook instance
- Cons: The mutation hook would need to hold the key in a ref and regenerate it after a successful mutation; adds stateful complexity to a thin adapter layer; still requires changing the `userApi` signature

### Option C: Generate inside the API function at call time (`crypto.randomUUID()`)
- Pros: Zero changes to call sites, mutation hooks, or component code; self-contained; `crypto.randomUUID()` is built into all modern browsers and produces a 36-character UUID v4 that satisfies the server's allowed charset; the API layer already owns other per-request concerns (CSRF token, tenant ID)
- Cons: A new key is generated on every call, so an automatic React Query retry would send a different key — the backend would treat it as a new operation rather than a replay; this is acceptable because neither import nor export mutations use React Query's automatic retry

## Decision

Generate the idempotency key inside `userApi.importUsers()` and `userApi.exportUsers()` using `crypto.randomUUID()` and pass it via the `headers` option that the fetch client's `buildHeaders()` already merges.

```ts
// src/shared/api/user/user.api.ts
importUsers(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return api
    .post('/api/v1/users/import', formData, {
      headers: { 'Idempotency-Key': crypto.randomUUID() },
    })
    .then(unwrapData);
},

exportUsers(params?: ExportUsersParams) {
  return api
    .get(buildExportUsersUrl(params), {
      headers: { 'Idempotency-Key': crypto.randomUUID() },
    })
    .then(unwrapData);
},
```

This follows the same pattern as `X-XSRF-TOKEN` and `X-Tenant-ID`, which are also resolved inside the fetch client rather than threaded from the call site.

## Consequences

- No changes are required in components, mutation hooks, or query keys.
- Each user action (button click) produces a unique key, which is the correct behaviour for preventing double-submits.
- Automatic React Query retries on failure would use a new key, so the backend would create a new operation rather than replay the original. This is acceptable: neither import nor export mutations have `retry` configured, and the idempotency guarantee is primarily for network-level duplicates within a single call, not for client-initiated retries.
- If retry-safe idempotency becomes a requirement (e.g. the mutation gains `retry: 3`), the key should be promoted to Option A or B: generate it at the call site, store it in a `useRef`, and pass it as an argument to `importUsers()` / `exportUsers()`.
- `crypto.randomUUID()` requires a secure context (`https://` or `localhost`). This matches the existing CSRF cookie requirement, so no new deployment constraint is introduced.
