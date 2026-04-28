# ADR-006: Manual CSRF Token Extraction for Laravel Sanctum

## Status

Accepted

## Date

2026-04-27

## Context

The backend uses Laravel Sanctum for stateful session authentication. Sanctum requires that state-changing requests (POST, PUT, PATCH, DELETE) include an `X-XSRF-TOKEN` header whose value matches the `XSRF-TOKEN` cookie that the server sets after a call to `/sanctum/csrf-cookie`.

Sanctum's CSRF protection is distinct from standard `SameSite` cookie protection: it requires the client to read the `XSRF-TOKEN` cookie and echo it back as a header, proving the request originates from JavaScript running on the same origin (JavaScript cannot read cookies on other origins, so cross-origin requests cannot forge this header).

Axios handles this automatically — it reads `XSRF-TOKEN` and sets `X-XSRF-TOKEN` by default. The app uses the native `fetch` API (not Axios), so this behavior must be implemented manually.

## Options Considered

### Option A: Switch to Axios for automatic CSRF handling
- Pros: Zero manual CSRF code; Axios intercepts, retry logic, and defaults are well-known
- Cons: Adds a large dependency (~15 KB); the custom `fetch`-based client already handles ETag caching (ADR-001), tenant headers (ADR-002), and error normalization — porting these to Axios interceptors adds complexity without benefit

### Option B: Manual cookie read + header injection in the fetch client (chosen)
- Pros: Explicit and auditable; no hidden behavior; works with the existing `fetch`-based `api-client.ts`; the CSRF logic is isolated in `buildHeaders()` and easy to find
- Cons: Must be kept in sync if Sanctum changes its cookie/header names (they are stable across Sanctum versions)

### Option C: Token-based auth (Bearer JWT) instead of session cookies
- Pros: No CSRF concern; works naturally with `fetch`
- Cons: Requires the backend to issue and validate tokens; stateless tokens cannot be invalidated server-side without a token store; session cookies with HttpOnly flag provide stronger XSS resistance for auth tokens

## Decision

`buildHeaders()` in `src/shared/lib/api-client.ts` reads the `XSRF-TOKEN` cookie using `getCookie()`, URL-decodes it (Laravel URL-encodes the value), and sets it as the `X-XSRF-TOKEN` header on every request.

```ts
const xsrf = getCookie('XSRF-TOKEN');
if (xsrf) {
  headers.set('X-XSRF-TOKEN', decodeURIComponent(xsrf));
}
```

Before the login form is submitted, `fetchCsrfCookie()` must be called to hit `/sanctum/csrf-cookie` and cause the server to set the `XSRF-TOKEN` cookie. `fetchCsrfCookie()` uses plain `fetch` (not the api client) to avoid a circular CSRF dependency.

The session token itself is an HttpOnly cookie set by the server — it is never accessible to JavaScript and is sent automatically by `credentials: 'include'` on all requests.

## Consequences

- All mutating requests automatically include the CSRF token without any per-call setup.
- `fetchCsrfCookie()` must be called before the first authenticated POST (i.e. before login). If it is skipped, the server will return 419 (CSRF token mismatch).
- The `XSRF-TOKEN` cookie is readable by JavaScript (not HttpOnly); this is intentional — Sanctum relies on it being readable for the echo-back mechanism.
- The WebSocket channel authorization endpoint (`broadcasting/auth`) uses the same CSRF header, implemented in `src/shared/lib/echo.ts` `buildAuthHeaders()` for the Echo client's `channelAuthorization` custom handler.
