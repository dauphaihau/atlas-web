# ADR-005: TypeScript DTOs for API Contracts Without Runtime Validation

## Status

Accepted

## Date

2026-04-27

## Context

Every API endpoint returns a typed response. The question is how to enforce that the actual HTTP response matches the expected shape, and where that enforcement should live.

Runtime schema validation libraries (Zod, Valibot, ArkType) can parse and validate API responses at runtime, throwing descriptive errors when the server returns an unexpected shape. This is commonly recommended for API boundaries because TypeScript types are erased at runtime.

## Options Considered

### Option A: Runtime validation with Zod on every response
- Pros: Catches server/client contract drift at runtime; produces descriptive parse errors; schemas double as TypeScript types via `z.infer`
- Cons: Adds ~14 KB (Zod) to the bundle; every new endpoint requires a schema definition alongside the TS type; parsing overhead on every response; in practice, this app owns both frontend and backend — contract drift is caught at the integration level

### Option B: TypeScript types only, `unwrapData()` shape check (chosen)
- Pros: Zero runtime overhead; no additional library; response types in `src/shared/api/*/dto.ts` are the single source of truth; `unwrapData()` throws if the `{ data }` wrapper is missing, catching the most common server error format change
- Cons: TypeScript types are erased at runtime — a server returning a structurally wrong response will propagate as `undefined` field accesses rather than a schema parse error; mismatches may surface later in rendering rather than at the fetch boundary

### Option C: OpenAPI code generation
- Pros: Types and validation auto-generated from the API spec; always in sync
- Cons: Requires maintaining an OpenAPI spec on the backend; adds a code-generation step to the build; currently out of scope

## Decision

We use TypeScript DTO interfaces in `src/shared/api/*/dto.ts` as the API contract. No runtime schema validation library is used.

`unwrapData()` in `api-client.ts` provides a minimal structural assertion: it throws if the response is `null` or missing a `data` key, which is the shape all backend success responses follow. This catches the most disruptive class of contract breakage (missing `data` wrapper) without full schema parsing.

This decision is predicated on the frontend and backend being co-developed in the same monorepo. When the server changes a response shape, the TypeScript types are updated at the same time, and TypeScript compilation catches mismatches across the call sites.

## Consequences

- Adding a new endpoint requires a DTO interface in the relevant `dto.ts` file; no schema definition is needed.
- Field-level contract drift (e.g. server renames a field) will surface as TypeScript errors when both files are updated together, or as `undefined` values at runtime if they drift out of sync.
- If the project ever needs to validate responses from third-party APIs (not the co-developed backend), Zod or equivalent should be applied at that specific boundary.
- `unwrapData()` must be called for all single-resource endpoints that return `{ data: T }`. Paginated list responses include `data` and `meta` and are handled directly by callers.
