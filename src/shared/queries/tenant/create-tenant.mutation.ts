import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateTenantRequestDto } from '@/shared/api/tenant';
import { tenantApi, tenantKeys } from '@/shared/api/tenant';

export function useCreateTenantMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTenantRequestDto) => tenantApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.all });
    },
  });
}
