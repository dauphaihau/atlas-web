# ADR-004: Disable Retries on 401 Responses in the Auth Query

## Status

Accepted

## Date

2026-04-27

## Context

`useMeQuery` (`src/shared/queries/auth/get-me.query.ts`) is the authentication check that runs on every page load. `AuthGuard` renders children (the protected layout) only when this query resolves successfully, and redirects to `/login` when it errors.

React Query retries failed queries by default (3 times with exponential backoff). If the `/me` request returns 401 (session expired or no session), React Query would retry it up to 3 times before settling on the error state.

## Options Considered

### Option A: Default React Query retry behavior (3 retries)
- Pros: Zero config; works correctly for transient network errors
- Cons: Delays the redirect to `/login` by several seconds while retries exhaust; on some timing windows, the redirect fires and `AuthGuard` mounts the login page while a retry is still in-flight, which can trigger a second `/me` request and a re-render loop

### Option B: `retry: false` globally
- Pros: Simple
- Cons: Eliminates retries for all queries, including ones that fail due to genuine transient network errors (DNS, brief server restart)

### Option C: Per-query custom retry that blocks retries on 401 (chosen)
- Pros: Preserves retry behavior for transient errors (e.g. `failureCount < 1` allows one retry on non-401 failures) while immediately settling 401 as a terminal error state
- Cons: Requires remembering to apply this pattern to any future auth-sensitive query

## Decision

`useMeQuery` uses a custom `retry` function:

```ts
retry: (failureCount, error) => {
  const err = error as { status?: number };
  if (err.status === 401) return false;
  return failureCount < 1;
},
```

A 401 response returns `false` immediately, stopping all retries. Any other error (network failure, 5xx) allows one retry before settling.

This causes `AuthGuard` to see the error state promptly on session expiry, allowing it to redirect to `/login` without delay or loop.

## Consequences

- Session expiry redirects to `/login` immediately after the first 401, with no retry delay.
- Transient non-auth errors still get one automatic retry.
- **Do not remove the `retry: false` branch for 401.** Without it, the auth redirect and the retry cycle can overlap, causing the app to fire multiple `/me` requests and potentially render the login page mid-flight while a retry is still running.
- Any future query that gates access to protected routes should apply the same 401 no-retry pattern.
