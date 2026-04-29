import { useQuery } from '@tanstack/react-query';
import { userApi, userKeys } from '@/shared/api/user';

export function useAssignableRolesQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: userKeys.assignableRoles(),
    queryFn: () => userApi.getAssignableRoles(),
    enabled: options?.enabled ?? true,
  });
}
