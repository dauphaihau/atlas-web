import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { LoginRequestDto } from '@/shared/api/auth';
import { authApi, authKeys } from '@/shared/api/auth';
import { setCurrentTenantId } from '@/shared/lib/tenant-context';

export function useLoginMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: LoginRequestDto) => authApi.login(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.me(), data.user);
      setCurrentTenantId(data.user.tenant_id ?? null);
    },
  });
}
