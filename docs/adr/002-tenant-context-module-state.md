# ADR-002: Tenant Context as Module-Level State + sessionStorage

## Status

Accepted

## Date

2026-04-27

## Context

This is a multi-tenant SaaS dashboard. Every API request must be scoped to the authenticated user's tenant by sending an `X-Tenant-ID` header. The tenant ID is known after the `/me` endpoint resolves and must be available to the fetch layer (`api-client.ts`) — which has no access to React component trees.

The tenant ID must also survive page reloads, because the first request after a reload (the `/me` auth check) needs to send the correct tenant scope.

## Options Considered

### Option A: React Context
- Pros: Standard React pattern, integrates well with hooks
- Cons: Context values are only accessible inside the component tree; the fetch client runs outside React, so it cannot read from Context without prop-drilling or dependency inversion

### Option B: Zustand or Redux global store
- Pros: Accessible anywhere via a module import, survives re-renders
- Cons: Adds a state-management dependency for a single scalar value; persistence across reloads still requires manual `localStorage`/`sessionStorage` sync

### Option C: URL path or query param (`/tenants/:id/...`)
- Pros: Makes tenant scope explicit and bookmarkable
- Cons: Requires routing changes across all pages; the backend is already header-based

### Option D: Module-level variable + sessionStorage (chosen)
- Pros: Accessible from the fetch layer as a plain import; no React dependency; sessionStorage gives per-tab isolation with automatic reload recovery; trivial to test
- Cons: Not reactive — React components that need the tenant ID must read it at query time, not observe changes

## Decision

The tenant ID is stored in a module-level variable (`currentTenantId`) in `src/shared/lib/tenant-context.ts` and mirrored to `sessionStorage` under the key `atlas_tenant_id`.

`getCurrentTenantId()` returns the in-memory value if set, falling back to `sessionStorage` on first read (e.g. after a page reload). `setCurrentTenantId()` writes both locations. The `api-client.ts` `buildHeaders()` function calls `getCurrentTenantId()` on every request.

**sessionStorage over localStorage:** `sessionStorage` is per-tab, so each browser tab is independently scoped to its tenant session. `localStorage` would share state across tabs, which could cause cross-tenant request leaks if a user opens two tabs with different tenant sessions.

The tenant ID is set inside `useMeQuery`'s `queryFn` after a successful `/me` response, and cleared on logout.

## Consequences

- The fetch layer has zero dependency on React to access the current tenant.
- Per-tab isolation: opening multiple tabs does not share tenant state between them.
- Tenant ID survives page reloads; the first `/me` request on reload sends the correct `X-Tenant-ID`.
- Super-admin users who have no tenant (`tenant_id: null`) send no `X-Tenant-ID` header, which the backend interprets as a global (non-scoped) request.
- Components cannot `subscribe` to tenant changes reactively; this is intentional — the tenant is set once at login and does not change during a session.
