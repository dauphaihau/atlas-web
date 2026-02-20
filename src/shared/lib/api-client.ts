import { getTokenFromCookie } from "@/shared/utils/token-cookie"

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "")
const API_PREFIX = "/api/v1"

/**
 * Base URL for v1 API (e.g. "" for same-origin /api/v1, or "http://localhost:8000" for full URL).
 */
export function getApiBaseUrl(): string {
  return API_BASE
}

/**
 * Full path prefix for API requests (e.g. /api/v1).
 */
export function getApiPathPrefix(): string {
  return API_PREFIX
}

/**
 * Full URL for an API path (path should start with /, e.g. /api/v1/me).
 */
export function getApiUrl(path: string): string {
  const p = path.startsWith("/") ? path : `${API_PREFIX}/${path.replace(/^\//, "")}`
  return API_BASE ? `${API_BASE}${p}` : p
}

export interface ApiRequestOptions extends RequestInit {
  /** If true, do not attach Authorization header. */
  skipAuth?: boolean
}

/**
 * Backend success response wrapper (ApiResponse::ok/created/accepted).
 * Unwrap with unwrapData() or .data in the API layer for single-resource endpoints.
 */
export interface ApiResponseWrapper<T, M = unknown> {
  data: T
  message?: string
  meta?: M
}

/** Unwrap backend { data } response; throws if missing. */
export function unwrapData<T>(res: ApiResponseWrapper<T> | null): T {
  if (res?.data == null) throw new Error("Unexpected API response: missing data")
  return res.data
}

/**
 * In-memory cache for GET responses that support ETag.
 * Key: full request URL (same URL may be used with different auth; server sends Vary: Authorization).
 */
const etagCache = new Map<string, { etag: string; data: unknown }>()

/** Clear ETag cache (e.g. on logout so the next user does not send the previous user's If-None-Match). */
export function clearEtagCache(): void {
  etagCache.clear()
}

function buildHeaders(init: RequestInit, body: string | FormData | undefined): Headers {
  const headers = new Headers(init.headers)
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json")
  }
  if (body !== undefined && !headers.has("Content-Type")) {
    if (typeof body === "string") {
      headers.set("Content-Type", "application/json")
    }
    // FormData: do not set Content-Type so browser sets multipart boundary
  }
  return headers
}

async function request<T>(
  method: string,
  path: string,
  data?: object | FormData,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { skipAuth, ...init } = options
  const url = path.startsWith("http") ? path : getApiUrl(path)

  let body: string | FormData | undefined
  if (data !== undefined) {
    body = data instanceof FormData ? data : JSON.stringify(data)
  }

  const headers = buildHeaders(init, body)
  if (!skipAuth) {
    const token = getTokenFromCookie()
    if (token) {
      headers.set("Authorization", "Bearer " + token)
    }
  }

  // GET: send If-None-Match when we have a cached ETag for this URL
  if (method === "GET") {
    const cached = etagCache.get(url)
    if (cached?.etag) {
      headers.set("If-None-Match", cached.etag)
    }
  }

  const res = await fetch(url, { ...init, method, headers, body })
  const text = await res.text()

  // 304 Not Modified: no body; reuse cached data for this URL
  if (res.status === 304) {
    const cached = etagCache.get(url)
    if (cached?.data != null) {
      return cached.data as T
    }
    // No cache entry (e.g. tab reopened); force refetch by throwing so caller can retry
    const err = new Error("Not Modified (no cached data)") as Error & { status?: number }
    err.status = 304
    throw err
  }

  let parsed: unknown
  try {
    parsed = text ? JSON.parse(text) : null
  } catch {
    parsed = null
  }

  if (!res.ok) {
    const err = new Error(
      (parsed && typeof parsed === "object" && "message" in parsed && typeof (parsed as { message: unknown }).message === "string")
        ? (parsed as { message: string }).message
        : res.statusText || "Request failed"
    ) as Error & { status?: number; body?: unknown }
    err.status = res.status
    err.body = parsed
    throw err
  }

  // GET 200: store ETag + body for future If-None-Match / 304
  if (method === "GET" && res.status === 200) {
    const etag = res.headers.get("ETag")
    if (etag?.trim()) {
      etagCache.set(url, { etag: etag.trim(), data: parsed })
    }
  }

  return parsed as T
}

/**
 * Axios-style API client. Body objects are automatically JSON.stringified.
 * Use FormData for multipart (e.g. file uploads); Content-Type is left unset for FormData.
 */
export const api = {
  get<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
    return request<T>("GET", path, undefined, options)
  },

  post<T>(path: string, data?: object | FormData, options: ApiRequestOptions = {}): Promise<T> {
    return request<T>("POST", path, data, options)
  },

  put<T>(path: string, data?: object | FormData, options: ApiRequestOptions = {}): Promise<T> {
    return request<T>("PUT", path, data, options)
  },

  patch<T>(path: string, data?: object | FormData, options: ApiRequestOptions = {}): Promise<T> {
    return request<T>("PATCH", path, data, options)
  },

  delete<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
    return request<T>("DELETE", path, undefined, options)
  },
}
