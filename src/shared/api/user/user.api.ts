import type {
  CreateUserRequestDto,
  ExportUsersParams,
  ExportUsersResponseDto,
  ImportStatusDto,
  ImportUsersResponseDto,
  ListUsersParams,
  ListUsersResponseDto,
  UserDto,
  UserStatsDto
} from './dto';
import {
  api, type ApiResponseWrapper, unwrapData, getApiUrl, getCookie 
} from '@/shared/lib/api-client';
import { getCurrentTenantId } from '@/shared/lib/tenant-context';

function buildListUsersUrl(params?: ListUsersParams): string {
  const base = '/api/v1/users';
  if (!params) return base;
  const searchParams = new URLSearchParams();
  if (params.page !== undefined) searchParams.set('page', String(params.page));
  if (params.per_page !== undefined) searchParams.set('per_page', String(params.per_page));
  if (params.search !== undefined && params.search !== '')
    searchParams.set('search', params.search);
  if (params.trashed !== undefined) searchParams.set('trashed', params.trashed);
  const qs = searchParams.toString();
  return qs ? `${base}?${qs}` : base;
}

function buildExportUsersUrl(params?: ExportUsersParams): string {
  const base = '/api/v1/users/export';
  if (!params) return base;
  const searchParams = new URLSearchParams();
  if (params.date_from) searchParams.set('date_from', params.date_from);
  if (params.date_to) searchParams.set('date_to', params.date_to);
  if (params.fields && params.fields.length > 0) {
    params.fields.forEach((field) => searchParams.append('fields[]', field));
  }
  const qs = searchParams.toString();
  return qs ? `${base}?${qs}` : base;
}

export const userApi = {
  list(params?: ListUsersParams): Promise<ListUsersResponseDto> {
    return api.get<ListUsersResponseDto>(buildListUsersUrl(params));
  },

  create(payload: CreateUserRequestDto): Promise<UserDto> {
    return api
      .post<ApiResponseWrapper<UserDto>>('/api/v1/users', payload)
      .then(unwrapData);
  },

  importUsers(file: File): Promise<ImportUsersResponseDto> {
    const formData = new FormData();
    formData.append('file', file);
    return api
      .post<ApiResponseWrapper<ImportUsersResponseDto>>('/api/v1/users/import', formData)
      .then(unwrapData);
  },

  getImportStatus(id: number): Promise<ImportStatusDto> {
    return api
      .get<ApiResponseWrapper<ImportStatusDto>>(`/api/v1/users/import/${id}/status`)
      .then(unwrapData);
  },

  /** Cancel an in-progress user import. No-op if already completed/cancelled. */
  cancelImport(id: number): Promise<void> {
    return api.delete(`/api/v1/users/import/${id}`).then(() => undefined);
  },

  updateMyAvatar(file: File): Promise<UserDto> {
    const formData = new FormData();
    formData.append('avatar', file);
    return api
      .post<ApiResponseWrapper<UserDto>>('/api/v1/me/avatar', formData)
      .then(unwrapData);
  },

  updateUserAvatar(userId: number, file: File): Promise<UserDto> {
    const formData = new FormData();
    formData.append('avatar', file);
    return api
      .post<ApiResponseWrapper<UserDto>>(`/api/v1/users/${userId}/avatar`, formData)
      .then(unwrapData);
  },

  /** Request users CSV export; returns signed download URL. */
  exportUsers(params?: ExportUsersParams): Promise<ExportUsersResponseDto> {
    return api
      .get<ApiResponseWrapper<ExportUsersResponseDto>>(buildExportUsersUrl(params))
      .then(unwrapData);
  },

  /** User counts (active, deleted, created today) for tabs/dashboard. */
  getStats(): Promise<UserStatsDto> {
    return api
      .get<ApiResponseWrapper<UserStatsDto>>('/api/v1/users/stats')
      .then(unwrapData);
  },

  /** Soft-delete a user (sets deleted_at). */
  deleteUser(id: number): Promise<void> {
    return api.delete(`/api/v1/users/${id}`).then(() => undefined);
  },

  /** Restore a soft-deleted user. */
  restoreUser(id: number): Promise<void> {
    return api.post(`/api/v1/users/${id}/restore`).then(() => undefined);
  },

  /** Permanently delete a user. Cannot be undone. */
  forceDeleteUser(id: number): Promise<void> {
    return api.delete(`/api/v1/users/${id}/force`).then(() => undefined);
  },

  /** Download blank CSV template for user import. Triggers a browser file download. */
  async downloadImportTemplate(): Promise<void> {
    const url = getApiUrl('/api/v1/users/import/template');
    const headers = new Headers({ Accept: 'text/csv' });
    const xsrf = getCookie('XSRF-TOKEN');
    if (xsrf) {
      try {
        headers.set('X-XSRF-TOKEN', decodeURIComponent(xsrf));
      }
      catch { headers.set('X-XSRF-TOKEN', xsrf) }
    }
    const tenantId = getCurrentTenantId();
    if (tenantId != null) headers.set('X-Tenant-ID', String(tenantId));

    const res = await fetch(url, { method: 'GET', headers, credentials: 'include' });
    if (!res.ok) throw new Error(`Failed to download template: ${res.statusText}`);

    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = blobUrl;
    anchor.download = 'users-import-template.csv';
    anchor.click();
    URL.revokeObjectURL(blobUrl);
  },
};
