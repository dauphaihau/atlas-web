import { useQuery } from '@tanstack/react-query';
import { authApi, authKeys } from '@/shared/api/auth';
import { setCurrentTenantId } from '@/shared/lib/tenant-context';

export function useMeQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: async () => {
      const user = await authApi.me();
      setCurrentTenantId(user.tenant_id ?? null);
      return user;
    },
    retry: (failureCount, error) => {
      const err = error as { status?: number };
      if (err.status === 401) return false;
      return failureCount < 1;
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}
