/**
 * Laravel Echo client for Reverb (WebSockets).
 * Private channel auth uses the same API base; auth is via server-set HttpOnly cookie (credentials: include).
 */

import Echo from "laravel-echo"
import Pusher from "pusher-js"
import { getCookie, getApiUrl } from "@/shared/lib/api-client"

declare global {
  interface Window {
    Pusher?: typeof Pusher
  }
}

// Required for Laravel Echo to use Pusher protocol (Reverb)
if (typeof window !== "undefined") {
  window.Pusher = Pusher
}

const REVERB_KEY = import.meta.env.VITE_REVERB_APP_KEY as string | undefined
const REVERB_HOST = import.meta.env.VITE_REVERB_HOST as string | undefined
const REVERB_PORT = import.meta.env.VITE_REVERB_PORT as string | undefined
const REVERB_SCHEME = (import.meta.env.VITE_REVERB_SCHEME as string) ?? "https"

let echoInstance: Echo<"reverb"> | null = null

/** True if Reverb env vars are set; use this to avoid creating Echo until needed. */
export function isEchoConfigured(): boolean {
  return Boolean(REVERB_KEY && REVERB_HOST)
}

/**
 * Custom Pusher authorizer that calls the auth endpoint with credentials so the browser sends the HttpOnly cookie.
 * Mirrors the X-XSRF-TOKEN logic in api-client.ts buildHeaders() so CSRF validation passes.
 */
function createCookieAuthorizer(authEndpoint: string) {
  return (_channel: { name: string }, _options: { authEndpoint: string }) => ({
    authorize(socketId: string, callback: (error: boolean, data?: Record<string, unknown>) => void) {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "application/json",
      }
      const xsrf = getCookie("XSRF-TOKEN")
      if (xsrf) {
        try {
          headers["X-XSRF-TOKEN"] = decodeURIComponent(xsrf)
        } catch {
          headers["X-XSRF-TOKEN"] = xsrf
        }
      }
      fetch(authEndpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({ socket_id: socketId, channel_name: _channel.name }),
        credentials: "include",
      })
        .then((res) => {
          if (!res.ok) {
            callback(true)
            return
          }
          return res.json().then((data) => callback(false, data))
        })
        .catch(() => callback(true))
    },
  })
}

/**
 * Returns a lazily-created Echo instance, or null if Reverb env vars are missing.
 * Auth uses credentials so the server-set HttpOnly cookie is sent to the broadcasting auth endpoint.
 */
export function getEcho(): Echo<"reverb"> | null {
  if (!isEchoConfigured()) {
    return null
  }
  if (echoInstance != null) {
    return echoInstance
  }
  const authEndpoint = getApiUrl("broadcasting/auth")
  const options = {
    broadcaster: "reverb" as const,
    key: REVERB_KEY,
    wsHost: REVERB_HOST,
    wsPort: REVERB_PORT ? Number(REVERB_PORT) : 80,
    wssPort: REVERB_PORT ? Number(REVERB_PORT) : 443,
    forceTLS: REVERB_SCHEME === "https",
    enabledTransports: ["ws", "wss"] as const,
    authEndpoint,
    auth: { headers: {} },
    authorizer: createCookieAuthorizer(authEndpoint),
  }
  // authorizer is a Pusher option (cookie-based auth); Echo passes options through to Pusher
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  echoInstance = new Echo(options as any)
  return echoInstance
}

/** Payload broadcast by ImportProgressUpdated (camelCase from Laravel). */
export interface ImportProgressPayload {
  importId: number
  totalRows: number
  processedRows: number
  createdCount: number
  updatedCount: number
  errorCount: number
  progressPercentage: number
}

/** Payload broadcast by ImportCompleted (camelCase from Laravel). */
export interface ImportCompletedPayload {
  importId: number
  status: string
  totalRows: number
  processedRows: number
  createdCount: number
  updatedCount: number
  errors: Array<{ row: number; message: string }>
}

export type ImportProgressListener = (payload: ImportProgressPayload) => void
export type ImportCompletedListener = (payload: ImportCompletedPayload) => void

export interface SubscribeToImportCallbacks {
  onProgress: ImportProgressListener
  onCompleted: ImportCompletedListener
}

/**
 * Subscribes to the private channel for the given import and listens for
 * import.progress and import.completed. Returns an unsubscribe function.
 * No-op and returns a no-op cleanup if Echo is not configured or auth is missing.
 */
export function subscribeToImport(
  importId: number,
  callbacks: SubscribeToImportCallbacks
): () => void {
  const echo = getEcho()
  if (echo == null) {
    return () => {}
  }
  const channelName = `imports.${importId}`
  const channel = echo.private(channelName)
  // Laravel broadcastAs() event names are listened with a leading dot
  channel.listen(".import.progress", (e: ImportProgressPayload) => {
    callbacks.onProgress(e)
  })
  channel.listen(".import.completed", (e: ImportCompletedPayload) => {
    callbacks.onCompleted(e)
  })
  return () => {
    echo.leave(channelName)
  }
}
