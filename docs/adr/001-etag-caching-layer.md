# ADR-001: ETag HTTP Caching Layer on Top of React Query

## Status

Accepted

## Date

2026-04-27

## Context

The app uses TanStack React Query for all server-state management. React Query provides client-side caching with configurable `staleTime` and `gcTime`, but it operates independently of HTTP cache semantics — it re-fetches data based on its own staleness rules without consulting the server about whether the resource has actually changed.

For endpoints that return large payloads (user lists, activity logs), this means wasting bandwidth by re-downloading identical responses whenever React Query decides the data is stale.

## Options Considered

### Option A: React Query staleTime only
- Pros: Zero additional complexity, built into React Query
- Cons: Prevents re-fetches for a fixed time window regardless of actual server state; stale data stays stale with no mechanism to know if the server has a newer version

### Option B: ETag/If-None-Match in the fetch layer
- Pros: Server decides when data is fresh; 304 responses save bandwidth; works orthogonally to React Query's cache — React Query still triggers refetches on its own schedule, but the network round-trip costs near-zero when data hasn't changed
- Cons: Adds an in-memory cache alongside React Query's cache; two layers of caching to reason about

### Option C: HTTP Cache-Control headers (browser cache)
- Pros: Fully automatic, zero code
- Cons: Requires the server to set `Cache-Control: public` or `private` headers; does not work well with session-authenticated API responses where `Vary: Authorization` invalidates across users; browser cache is shared across tabs and can serve stale data after logout

## Decision

We implement ETag caching in the custom fetch client (`src/shared/lib/api-client.ts`) as a second caching layer below React Query.

When a GET response includes an `ETag` header, the URL and response body are stored in an in-memory `etagCache` map. Subsequent requests for the same URL include `If-None-Match: <etag>`. If the server responds with `304 Not Modified`, the client returns the cached body directly, so React Query receives a fresh value without a new JSON payload over the wire.

The `etagCache` is cleared on logout (`clearEtagCache()`) to prevent a new user from sending the previous user's `If-None-Match` token.

```
React Query staleness check → fetch client → If-None-Match header
                                              ↓ 200: parse + store etag
                                              ↓ 304: return cached body
```

## Consequences

- GET responses that include an `ETag` header benefit from reduced bandwidth on refetches, even when React Query considers the data stale.
- The `etagCache` is process-local memory; opening a new tab starts with an empty cache.
- `clearEtagCache()` must be called on logout to avoid cross-user cache contamination.
- The server must send `ETag` headers and handle `If-None-Match` for this to have any effect; endpoints that don't send `ETag` are unaffected.
- Two independent caches exist: React Query's (client staleness) and `etagCache` (HTTP conditional requests). They serve different purposes and should not be conflated.
