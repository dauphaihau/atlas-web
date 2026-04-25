import type {
  CreateTenantRequestDto,
  ListTenantsParams,
  ListTenantsResponseDto,
  TenantDto,
  UpdateTenantRequestDto
} from './dto';
import { api, type ApiResponseWrapper, unwrapData } from '@/shared/lib/api-client';

function buildListTenantsUrl(params?: ListTenantsParams): string {
  const base = '/api/v1/tenants';
  if (!params) return base;
  const searchParams = new URLSearchParams();
  if (params.page !== undefined) searchParams.set('page', String(params.page));
  if (params.per_page !== undefined)
    searchParams.set('per_page', String(params.per_page));
  const qs = searchParams.toString();
  return qs ? `${base}?${qs}` : base;
}

export const tenantApi = {
  list(params?: ListTenantsParams): Promise<ListTenantsResponseDto> {
    return api.get<ListTenantsResponseDto>(buildListTenantsUrl(params));
  },

  get(id: number): Promise<TenantDto> {
    return api
      .get<ApiResponseWrapper<TenantDto>>(`/api/v1/tenants/${id}`)
      .then(unwrapData);
  },

  create(payload: CreateTenantRequestDto): Promise<TenantDto> {
    return api
      .post<ApiResponseWrapper<TenantDto>>('/api/v1/tenants', payload)
      .then(unwrapData);
  },

  update(id: number, payload: UpdateTenantRequestDto): Promise<TenantDto> {
    return api
      .put<ApiResponseWrapper<TenantDto>>(`/api/v1/tenants/${id}`, payload)
      .then(unwrapData);
  },

  delete(id: number): Promise<void> {
    return api.delete(`/api/v1/tenants/${id}`).then(() => undefined);
  },
};
