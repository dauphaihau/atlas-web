import type {
  CreateUserRequestDto,
  ExportUsersResponseDto,
  ImportStatusDto,
  ImportUsersResponseDto,
  ListUsersParams,
  ListUsersResponseDto,
  UserDto,
  UserStatsDto,
} from "./dto"
import { api, type ApiResponseWrapper, unwrapData } from "@/shared/lib/api-client"

function buildListUsersUrl(params?: ListUsersParams): string {
  const base = "/api/v1/users"
  if (!params) return base
  const searchParams = new URLSearchParams()
  if (params.page !== undefined) searchParams.set("page", String(params.page))
  if (params.per_page !== undefined) searchParams.set("per_page", String(params.per_page))
  if (params.search !== undefined && params.search !== "")
    searchParams.set("search", params.search)
  if (params.trashed !== undefined) searchParams.set("trashed", params.trashed)
  const qs = searchParams.toString()
  return qs ? `${base}?${qs}` : base
}

export const userApi = {
  list(params?: ListUsersParams): Promise<ListUsersResponseDto> {
    return api.get<ListUsersResponseDto>(buildListUsersUrl(params))
  },

  create(payload: CreateUserRequestDto): Promise<UserDto> {
    return api
      .post<ApiResponseWrapper<UserDto>>("/api/v1/users", payload)
      .then(unwrapData)
  },

  importUsers(file: File): Promise<ImportUsersResponseDto> {
    const formData = new FormData()
    formData.append("file", file)
    return api
      .post<ApiResponseWrapper<ImportUsersResponseDto>>("/api/v1/users/import", formData)
      .then(unwrapData)
  },

  getImportStatus(id: number): Promise<ImportStatusDto> {
    return api
      .get<ApiResponseWrapper<ImportStatusDto>>(`/api/v1/users/import/${id}/status`)
      .then(unwrapData)
  },

  updateMyAvatar(file: File): Promise<UserDto> {
    const formData = new FormData()
    formData.append("avatar", file)
    return api
      .post<ApiResponseWrapper<UserDto>>("/api/v1/me/avatar", formData)
      .then(unwrapData)
  },

  updateUserAvatar(userId: number, file: File): Promise<UserDto> {
    const formData = new FormData()
    formData.append("avatar", file)
    return api
      .post<ApiResponseWrapper<UserDto>>(`/api/v1/users/${userId}/avatar`, formData)
      .then(unwrapData)
  },

  /** Request users CSV export; returns signed download URL. */
  exportUsers(): Promise<ExportUsersResponseDto> {
    return api
      .get<ApiResponseWrapper<ExportUsersResponseDto>>("/api/v1/users/export")
      .then(unwrapData)
  },

  /** User counts (active, deleted, created today) for tabs/dashboard. */
  getStats(): Promise<UserStatsDto> {
    return api
      .get<ApiResponseWrapper<UserStatsDto>>("/api/v1/users/stats")
      .then(unwrapData)
  },

  /** Soft-delete a user (sets deleted_at). */
  deleteUser(id: number): Promise<void> {
    return api.delete(`/api/v1/users/${id}`).then(() => undefined)
  },

  /** Restore a soft-deleted user. */
  restoreUser(id: number): Promise<void> {
    return api.post(`/api/v1/users/${id}/restore`).then(() => undefined)
  },

  /** Permanently delete a user. Cannot be undone. */
  forceDeleteUser(id: number): Promise<void> {
    return api.delete(`/api/v1/users/${id}/force`).then(() => undefined)
  },
}
