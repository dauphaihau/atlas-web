# ADR-003: Real-Time Broadcast Events Written Directly Into React Query Cache

## Status

Accepted

## Date

2026-04-27

## Context

User CSV imports are long-running background jobs. The UI needs to show live progress (percentage, row counts, errors) as the job runs on the server. The server emits two WebSocket broadcast events via Laravel Reverb: `ImportProgressUpdated` (periodic progress) and `ImportCompleted` (terminal state).

There are two natural mechanisms for surfacing this state in the UI: polling the import status endpoint, and listening to WebSocket events. The question is how to reconcile them into a single piece of UI state.

## Options Considered

### Option A: Separate real-time state (Zustand / React Context)
- Pros: Clean separation between server state (React Query) and real-time state; easy to reason about in isolation
- Cons: Creates two sources of truth for the same resource (`ImportStatusDto`); components must merge/prioritize between them; the polling fallback and the WebSocket path diverge, making it easy to introduce subtle bugs where one path updates but the other doesn't

### Option B: Invalidate React Query on broadcast (force refetch)
- Pros: Simple — broadcast just triggers `queryClient.invalidateQueries()`; React Query fetches the canonical server state
- Cons: Every broadcast event triggers a round-trip to the server; at high progress-update frequency this creates unnecessary load; also introduces a race where the UI may briefly show stale data between the event and the refetch completing

### Option C: Write broadcast payloads into React Query cache directly (chosen)
- Pros: Single source of truth — the same query key that polling uses is updated by broadcast; components subscribe to one place; the polling fallback and WebSocket path produce identical cache shapes so they are interchangeable; UI updates are instantaneous with no refetch latency
- Cons: Broadcast payloads (camelCase from Laravel) must be mapped to the server DTO shape (snake_case) before writing; this mapping (`importStatusFromProgress`, `importStatusFromCompleted`) must be kept in sync with the server DTO

## Decision

Broadcast payloads are mapped to `ImportStatusDto` objects via `importStatusFromProgress()` and `importStatusFromCompleted()` (`src/shared/api/user/import-status-from-broadcast.ts`) and written into the React Query cache with `queryClient.setQueryData(importStatusKey(importId), ...)`.

This means:
- The polling query (`useImportStatusQuery`) and the WebSocket subscription write to the same cache key.
- When the WebSocket is available, polling can be disabled or run at a low frequency as a fallback.
- Components read from one query hook regardless of which transport delivered the last update.

## Consequences

- `importStatusFromProgress` and `importStatusFromCompleted` are the authoritative mapping between broadcast payloads and the cache shape. If the server DTO changes, these mappers must be updated alongside.
- The broadcast payload uses camelCase keys (Laravel's default JSON serialization); the DTO uses snake_case (matching the REST API). This asymmetry is intentional and isolated to the mapper functions.
- If the WebSocket is unavailable (`isEchoConfigured()` returns false), polling is the only update path and the broadcast code path is a no-op.
- React Query's `staleTime` on the import status query should be low (or zero) to allow both WebSocket writes and polling to flow through without being suppressed.
