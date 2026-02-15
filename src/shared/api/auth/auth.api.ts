import type {
  LoginRequestDto,
  LoginResponseDto,
  RegisterRequestDto,
  RegisterResponseDto,
  UserDto,
} from "./dto"
import { api } from "@/shared/lib/api-client"

export const authApi = {
  login(payload: LoginRequestDto): Promise<LoginResponseDto> {
    return api.post<LoginResponseDto>("/api/v1/login", payload, { skipAuth: true })
  },

  register(payload: RegisterRequestDto): Promise<RegisterResponseDto> {
    return api.post<RegisterResponseDto>("/api/v1/register", payload, { skipAuth: true })
  },

  logout(): Promise<void> {
    return api.post<void>("/api/v1/logout").then(() => undefined)
  },

  me(): Promise<UserDto> {
    return api.get<UserDto>("/api/v1/me")
  },
}
