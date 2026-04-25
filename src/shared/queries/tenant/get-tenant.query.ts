import { useQuery } from '@tanstack/react-query';
import { tenantApi, tenantKeys } from '@/shared/api/tenant';

export function useTenantQuery(id: number | null) {
  return useQuery({
    queryKey: tenantKeys.detail(id ?? 0),
    queryFn: () => tenantApi.get(id!),
    enabled: id != null && id > 0,
  });
}
