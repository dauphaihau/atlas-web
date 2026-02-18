import type { UserDto } from "../auth/dto"

export type { UserDto }

/** POST /v1/users request body (admin create user). */
export interface CreateUserRequestDto {
  name: string
  email: string
  password: string
}

/** POST /v1/users/import response (202 Accepted). */
export interface ImportUsersResponseDto {
  id: number
  status: string
  message?: string
}

/** GET /v1/users/import/{id}/status response. */
export interface ImportStatusDto {
  id: number
  status: string
  total_rows: number
  processed_rows: number
  progress_percentage: number
  created: number
  updated: number
  errors: Array<{ row: number; message: string }>
  started_at: string | null
  completed_at: string | null
}

/** GET /v1/users query params (paginated list). */
export interface ListUsersParams {
  page?: number
  per_page?: number
  search?: string
  trashed?: "with" | "only"
}

/** GET /v1/users response (paginated list). */
export interface ListUsersResponseDto {
  data: UserDto[]
  meta: {
    total: number
    per_page: number
    current_page: number
  }
}

/** GET /v1/users/export response (download URL for CSV). */
export interface ExportUsersResponseDto {
  path: string
  url: string
  expires_at?: string
}
