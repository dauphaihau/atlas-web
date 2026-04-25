import { useQuery } from '@tanstack/react-query';
import type { ListUsersParams } from '@/shared/api/user';
import { userApi, userKeys } from '@/shared/api/user';

export function useUsersQuery(params?: ListUsersParams) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => userApi.list(params),
  });
}
