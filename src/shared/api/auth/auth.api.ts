import type {
  LoginRequestDto,
  LoginWebResponseDto,
  AcceptInvitationRequestDto,
  InvitationDto,
  RegisterRequestDto,
  RegisterResponseDto,
  UpdateProfileRequestDto,
  UserDto
} from './dto';
import {
  api, fetchCsrfCookie, type ApiResponseWrapper, unwrapData 
} from '@/shared/lib/api-client';

export const authApi = {
  async login(payload: LoginRequestDto): Promise<LoginWebResponseDto> {
    await fetchCsrfCookie();
    return api
      .post<ApiResponseWrapper<LoginWebResponseDto>>('/api/v1/login', payload, { skipAuth: true })
      .then(unwrapData);
  },

  register(payload: RegisterRequestDto): Promise<RegisterResponseDto> {
    return api
      .post<ApiResponseWrapper<RegisterResponseDto>>('/api/v1/register', payload, { skipAuth: true })
      .then(unwrapData);
  },

  logout(): Promise<void> {
    return api.post<void>('/api/v1/logout').then(() => undefined);
  },

  me(): Promise<UserDto> {
    return api.get<ApiResponseWrapper<UserDto>>('/api/v1/me').then(unwrapData);
  },

  updateProfile(payload: UpdateProfileRequestDto): Promise<UserDto> {
    return api
      .patch<ApiResponseWrapper<UserDto>>('/api/v1/me', payload)
      .then(unwrapData);
  },

  invitation(email: string, token: string): Promise<InvitationDto> {
    const params = new URLSearchParams({ email, token });
    return api
      .get<ApiResponseWrapper<InvitationDto>>(`/api/v1/invitations/accept?${params.toString()}`, { skipAuth: true })
      .then(unwrapData);
  },

  acceptInvitation(payload: AcceptInvitationRequestDto): Promise<{ email: string }> {
    return api
      .post<ApiResponseWrapper<{ email: string }>>('/api/v1/invitations/accept', payload, { skipAuth: true })
      .then(unwrapData);
  },
};
