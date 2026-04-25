import type { QueryKey } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ListTenantsResponseDto } from '@/shared/api/tenant';
import { tenantApi, tenantKeys } from '@/shared/api/tenant';

type PreviousListState = { queryKey: QueryKey; snapshot: ListTenantsResponseDto };

export function useDeleteTenantMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => tenantApi.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: tenantKeys.all });
      const previousListStates: PreviousListState[] = [];
      const listEntries = queryClient.getQueriesData<ListTenantsResponseDto>({
        queryKey: tenantKeys.all,
      });
      for (const [queryKey, listData] of listEntries) {
        if (
          listData?.data != null &&
          Array.isArray(listData.data) &&
          listData.meta != null
        ) {
          const hasTenant = listData.data.some((tenant) => tenant.id === id);
          if (!hasTenant) continue;
          previousListStates.push({ queryKey, snapshot: { ...listData } });
          const nextData: ListTenantsResponseDto = {
            ...listData,
            meta: {
              ...listData.meta,
              total: Math.max(0, listData.meta.total - 1),
            },
          };
          nextData.data = listData.data.filter((tenant) => tenant.id !== id);
          queryClient.setQueryData(queryKey, nextData);
        }
      }
      return { previousListStates };
    },
    onError: (_err, _id, context) => {
      if (context?.previousListStates) {
        for (const { queryKey, snapshot } of context.previousListStates) {
          queryClient.setQueryData(queryKey, snapshot);
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.all });
    },
  });
}
