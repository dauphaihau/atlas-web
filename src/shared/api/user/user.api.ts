import type { CreateUserRequestDto, ImportUsersResponseDto, UserDto } from "./dto"
import { api } from "@/shared/lib/api-client"

export const userApi = {
  list(): Promise<UserDto[]> {
    return api.get<UserDto[]>("/api/v1/users")
  },

  create(payload: CreateUserRequestDto): Promise<UserDto> {
    return api.post<UserDto>("/api/v1/users", payload)
  },

  importUsers(file: File): Promise<ImportUsersResponseDto> {
    const formData = new FormData()
    formData.append("file", file)
    return api.post<ImportUsersResponseDto>("/api/v1/users/import", formData)
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
}
