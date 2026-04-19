/** Single tenant (GET tenants, tenants/:id). */
export interface TenantDto {
  id: number
  name: string
  slug: string
  settings: Record<string, unknown> | null
  is_active: boolean
  created_at: string
  updated_at: string
}

/** GET /v1/tenants query params (paginated list). */
export interface ListTenantsParams {
  page?: number
  per_page?: number
}

/** GET /v1/tenants response (paginated list). */
export interface ListTenantsResponseDto {
  data: TenantDto[]
  meta: {
    total: number
    per_page: number
    current_page: number
  }
}

/** POST /v1/tenants request body (create tenant). */
export interface CreateTenantRequestDto {
  name: string
  slug: string
  settings?: Record<string, unknown> | null
  is_active?: boolean
}

/** PUT /v1/tenants/:id request body (update tenant). */
export interface UpdateTenantRequestDto {
  name?: string
  slug?: string
  settings?: Record<string, unknown> | null
  is_active?: boolean
}
