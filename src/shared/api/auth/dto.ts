/** User shape returned by API (UserResource, login, register, me). */
export interface UserDto {
  id: number
  name: string
  email: string
  avatar_url: string | null
  role?: string | null
  created_at: string | null
}

/** POST /v1/login request body. */
export interface LoginRequestDto {
  email: string
  password: string
}

/** POST /v1/login response. */
export interface LoginResponseDto {
  token: string
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
