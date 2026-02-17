/**
 * Laravel Echo client for Reverb (WebSockets).
 * Private channel auth uses the same API base and Bearer token as the rest of the app.
 */

import Echo from "laravel-echo"
import Pusher from "pusher-js"
import { getApiUrl } from "@/shared/lib/api-client"
import { getTokenFromCookie } from "@/shared/utils/get-token-cookie-name"

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
 * Returns a lazily-created Echo instance, or null if Reverb env vars are missing.
 * Auth headers are set at creation time (current token from cookie).
 */
export function getEcho(): Echo<"reverb"> | null {
  if (!isEchoConfigured()) {
    return null
  }
  if (echoInstance != null) {
    return echoInstance
  }
  const token = getTokenFromCookie()
  echoInstance = new Echo({
    broadcaster: "reverb",
    key: REVERB_KEY,
    wsHost: REVERB_HOST,
    wsPort: REVERB_PORT ? Number(REVERB_PORT) : 80,
    wssPort: REVERB_PORT ? Number(REVERB_PORT) : 443,
    forceTLS: REVERB_SCHEME === "https",
    enabledTransports: ["ws", "wss"],
    authEndpoint: getApiUrl("broadcasting/auth"),
    auth: {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
  })
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
