import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UpdateTenantRequestDto } from '@/shared/api/tenant';
import { tenantApi, tenantKeys } from '@/shared/api/tenant';

export function useUpdateTenantMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateTenantRequestDto }) =>
      tenantApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.all });
    },
  });
}
