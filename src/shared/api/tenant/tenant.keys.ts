export interface ListTenantsQueryParams {
  page?: number
  per_page?: number
}

export const tenantKeys = {
  all: ["tenants"] as const,
  list: (params?: ListTenantsQueryParams) =>
    [...tenantKeys.all, "list", params ?? {}] as const,
  detail: (id: number) => [...tenantKeys.all, "detail", id] as const,
}
