import { useMutation, useQueryClient } from "@tanstack/react-query"
import { userApi, userKeys } from "@/shared/api/user"

export function useCancelImportMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => userApi.cancelImport(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: userKeys.importStatus(id) })
      queryClient.invalidateQueries({ queryKey: userKeys.all })
    },
  })
}
