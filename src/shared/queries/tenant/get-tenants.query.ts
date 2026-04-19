import { useQuery } from "@tanstack/react-query"
import type { ListTenantsParams } from "@/shared/api/tenant"
import { tenantApi, tenantKeys } from "@/shared/api/tenant"

export function useTenantsQuery(params?: ListTenantsParams) {
  return useQuery({
    queryKey: tenantKeys.list(params),
    queryFn: () => tenantApi.list(params),
  })
}
