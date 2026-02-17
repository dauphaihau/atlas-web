import type {
  CreateUserRequestDto,
  ExportUsersResponseDto,
  ImportStatusDto,
  ImportUsersResponseDto,
  ListUsersParams,
  ListUsersResponseDto,
  UserDto,
} from "./dto"
import { api } from "@/shared/lib/api-client"

function buildListUsersUrl(params?: ListUsersParams): string {
  const base = "/api/v1/users"
  if (!params || (params.page === undefined && params.per_page === undefined)) {
    return base
  }
  const search = new URLSearchParams()
  if (params.page !== undefined) search.set("page", String(params.page))
  if (params.per_page !== undefined) search.set("per_page", String(params.per_page))
  return `${base}?${search.toString()}`
}

export const userApi = {
  list(params?: ListUsersParams): Promise<ListUsersResponseDto> {
    return api.get<ListUsersResponseDto>(buildListUsersUrl(params))
  },

  create(payload: CreateUserRequestDto): Promise<UserDto> {
    return api.post<UserDto>("/api/v1/users", payload)
  },

  importUsers(file: File): Promise<ImportUsersResponseDto> {
    const formData = new FormData()
    formData.append("file", file)
    return api.post<ImportUsersResponseDto>("/api/v1/users/import", formData)
  },

  getImportStatus(id: number): Promise<ImportStatusDto> {
    return api.get<ImportStatusDto>(`/api/v1/users/import/${id}/status`)
  },

  updateMyAvatar(file: File): Promise<UserDto> {
    const formData = new FormData()
    formData.append("avatar", file)
    return api.post<UserDto>("/api/v1/me/avatar", formData)
  },

  updateUserAvatar(userId: number, file: File): Promise<UserDto> {
    const formData = new FormData()
    formData.append("avatar", file)
    return api.post<UserDto>(`/api/v1/users/${userId}/avatar`, formData)
  },

  /** Request users CSV export; returns signed download URL. */
  exportUsers(): Promise<ExportUsersResponseDto> {
    return api.get<ExportUsersResponseDto>("/api/v1/users/export")
  },
}
