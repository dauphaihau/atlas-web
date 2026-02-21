import type { QueryKey } from "@tanstack/react-query"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { ListUsersResponseDto } from "@/shared/api/user"
import { userApi, userKeys } from "@/shared/api/user"

type PreviousListState = { queryKey: QueryKey; data: ListUsersResponseDto }

export function useDeleteUserMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => userApi.deleteUser(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: userKeys.all })
      const previousListStates: PreviousListState[] = []
      const listEntries = queryClient.getQueriesData<ListUsersResponseDto>({
        queryKey: userKeys.all,
      })
      for (const [queryKey, listData] of listEntries) {
        if (
          listData?.data != null &&
          Array.isArray(listData.data) &&
          listData.meta != null
        ) {
          const hasUser = listData.data.some((u) => u.id === id)
          if (!hasUser) continue
          previousListStates.push({ queryKey, data: { ...listData } })
          const nextData: ListUsersResponseDto = {
            data: listData.data.filter((u) => u.id !== id),
            meta: {
              ...listData.meta,
              total: Math.max(0, listData.meta.total - 1),
            },
          }
          queryClient.setQueryData(queryKey, nextData)
        }
      }
      return { previousListStates }
    },
    onError: (_err, _id, context) => {
      if (context?.previousListStates) {
        for (const { queryKey, data } of context.previousListStates) {
          queryClient.setQueryData(queryKey, data)
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all })
    },
  })
}
