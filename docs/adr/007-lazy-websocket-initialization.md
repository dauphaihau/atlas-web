# ADR-007: Lazy WebSocket Initialization With Config-Change Detection

## Status

Accepted

## Date

2026-04-27

## Context

The app uses Laravel Echo (Reverb/Pusher protocol) for real-time WebSocket events. WebSocket configuration comes from environment variables (`VITE_REVERB_APP_KEY`, `VITE_REVERB_HOST`, `VITE_REVERB_PORT`, `VITE_REVERB_SCHEME`).

In production these are always set. In development they may be absent if the developer is not running the Reverb server locally. In CI and test environments they are typically unset.

The question is when to create the Echo instance and how to handle config changes.

## Options Considered

### Option A: Eager initialization at module load time
- Pros: Instance is always ready when first needed
- Cons: Throws or creates a broken connection if env vars are missing; Vite HMR can change env vars without a full page reload, leaving a stale Echo instance connected to the wrong host; tests that don't intend to use WebSockets pull in the Echo/Pusher bundle

### Option B: Lazy initialization via `getEcho()` with `isEchoConfigured()` guard (chosen)
- Pros: No connection attempt when env vars are absent; `isEchoConfigured()` lets callers opt out cleanly; config-change detection (signature comparison) resets a stale connection if env vars change between calls
- Cons: First call to `getEcho()` pays the initialization cost; callers must handle `null` return

## Decision

`src/shared/lib/echo.ts` exports:

- `isEchoConfigured()` — returns `true` only when `VITE_REVERB_APP_KEY` and `VITE_REVERB_HOST` are set. Use this to skip subscription setup entirely in environments without Reverb.
- `getEcho()` — lazily creates the Echo instance on first call. Computes a JSON config signature from all env vars and the auth endpoint URL; if a subsequent call finds the signature has changed (e.g. HMR env var update), it calls `resetEcho()` before creating a fresh instance.
- `resetEcho()` — disconnects and nulls the instance. Called on logout to tear down active channels.

```
getEcho() called
  ↓ isEchoConfigured() == false → return null
  ↓ signature matches cached → return existing instance
  ↓ signature changed → resetEcho() → create new instance
  ↓ no instance yet → create new instance
```

## Consequences

- In environments without Reverb configured, no WebSocket connection is attempted and no error is thrown; real-time features degrade gracefully to polling.
- `resetEcho()` must be called on logout to ensure the next user's session does not receive events from the previous user's channels.
- Callers of `getEcho()` must handle `null` (no-op return for the unsubscribe function in `subscribeToImport`).
- The config-change detection is based on a serialized JSON signature; it covers key, host, port, scheme, and the auth endpoint. If a new env var is added to the Echo config, it must be included in the signature object.
