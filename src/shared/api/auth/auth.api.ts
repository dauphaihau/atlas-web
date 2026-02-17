import type {
  LoginRequestDto,
  LoginResponseDto,
  RegisterRequestDto,
  RegisterResponseDto,
  UserDto,
} from "./dto"
import { api, type ApiResponseWrapper, unwrapData } from "@/shared/lib/api-client"

export const authApi = {
  login(payload: LoginRequestDto): Promise<LoginResponseDto> {
    return api
      .post<ApiResponseWrapper<LoginResponseDto>>("/api/v1/login", payload, { skipAuth: true })
      .then(unwrapData)
  },

  register(payload: RegisterRequestDto): Promise<RegisterResponseDto> {
    return api
      .post<ApiResponseWrapper<RegisterResponseDto>>("/api/v1/register", payload, { skipAuth: true })
      .then(unwrapData)
  },

  logout(): Promise<void> {
    return api.post<void>("/api/v1/logout").then(() => undefined)
  },

  me(): Promise<UserDto> {
    return api.get<ApiResponseWrapper<UserDto>>("/api/v1/me").then(unwrapData)
  },
}
