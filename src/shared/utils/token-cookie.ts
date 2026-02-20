/**
 * Returns the cookie name used for auth token storage.
 * Centralized for consistency across shared code.
 */
export function getTokenCookieName(): string {
  return "token"
}

const COOKIE_MAX_AGE_DAYS = 365

/**
 * Returns the current auth token from cookie, or null.
 */
export function getTokenFromCookie(): string | null {
  const name = getTokenCookieName()
  const match = document.cookie.match(new RegExp("(?:^|; )" + encodeURIComponent(name) + "=([^;]*)"))
  return match ? decodeURIComponent(match[1]) : null
}

/**
 * Stores the auth token in a cookie.
 */
export function setTokenCookie(token: string): void {
  const name = getTokenCookieName()
  const maxAge = COOKIE_MAX_AGE_DAYS * 24 * 60 * 60
  document.cookie =
    encodeURIComponent(name) + "=" + encodeURIComponent(token) + "; path=/; max-age=" + maxAge + "; SameSite=Lax"
}

/**
 * Removes the auth token cookie.
 */
export function clearTokenCookie(): void {
  const name = getTokenCookieName()
  document.cookie = encodeURIComponent(name) + "=; path=/; max-age=0"
}
