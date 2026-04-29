/** User shape returned by API (UserResource, login, register, me). */
export interface UserDto {
  id: number
  name: string
  email: string
  avatar_url: string | null
  /** Role slugs (RBAC). Use roles for nav/checks; role is deprecated. */
  roles?: string[]
  /** @deprecated Use roles instead. */
  role?: string | null
  invitation_status?: string
  /** Tenant ID for non–super-admins; null for super_admin. Sent as X-Tenant-ID on requests. */
  tenant_id?: number | null
  version: number
  created_at: string | null
  deleted_at?: string | null
}

/** PATCH /v1/me request body (update own profile). */
export interface UpdateProfileRequestDto {
  version: number
  name?: string
  email?: string
  password?: string
}

/** POST /v1/login request body. */
export interface LoginRequestDto {
  email: string
  password: string
}

/** POST /v1/login response (Bearer token in body). */
export interface LoginResponseDto {
  token: string
  user: UserDto
}

/** POST /v1/login/web response (token in HttpOnly cookie; no token in body). */
export interface LoginWebResponseDto {
  user: UserDto
}

/** POST /v1/register request body. */
export interface RegisterRequestDto {
  name: string
  email: string
  password: string
}

/** POST /v1/register response. */
export interface RegisterResponseDto {
  token: string
  user: UserDto
}

export interface InvitationDto {
  name: string
  email: string
}

export interface AcceptInvitationRequestDto {
  email: string
  token: string
  password: string
  password_confirmation: string
}
