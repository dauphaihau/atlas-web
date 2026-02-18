import { useMutation, useQueryClient } from "@tanstack/react-query"
import { userApi, userKeys } from "@/shared/api/user"

export function useRestoreUserMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => userApi.restoreUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all })
    },
  })
}
