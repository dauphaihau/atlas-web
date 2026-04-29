import type { UserDto } from '../auth/dto';

export type { UserDto };

/** POST /v1/users request body (admin create user). */
export interface CreateUserRequestDto {
  name: string
  email: string
  password?: string
  role?: string
  send_invite?: boolean
}

/** GET /v1/roles/assignable role item. */
export interface AssignableRoleDto {
  slug: string
  name: string
  description: string | null
}

/** PATCH /v1/users/:id request body (admin update user). */
export interface UpdateUserRequestDto {
  version: number
  name?: string
  email?: string
  password?: string
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
  trashed?: 'with' | 'only'
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

/** GET /v1/users/export query params. */
export type ExportUsersField = 'id' | 'name' | 'email' | 'roles' | 'created_at';

export interface ExportUsersParams {
  /** ISO date string (YYYY-MM-DD). No filter when omitted. */
  date_from?: string
  /** ISO date string (YYYY-MM-DD). No filter when omitted. */
  date_to?: string
  /** Subset of columns to include. All columns when omitted. */
  fields?: ExportUsersField[]
}

/** GET /v1/users/export response (download URL for CSV). */
export interface ExportUsersResponseDto {
  path: string
  url: string
  expires_at?: string
}

/** GET /v1/users/stats response (counts for tabs/dashboard). */
export interface UserStatsDto {
  total_active: number
  total_deleted: number
  created_today: number
}
