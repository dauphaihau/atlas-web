import type { UserDto } from "../auth/dto"

export type { UserDto }

/** POST /v1/users request body (admin create user). */
export interface CreateUserRequestDto {
  name: string
  email: string
  password: string
}

/** POST /v1/users/import response. */
export interface ImportUsersResponseDto {
  created: number
  updated: number
  errors: string[]
}
