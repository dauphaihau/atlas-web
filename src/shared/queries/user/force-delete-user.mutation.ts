import { useMutation, useQueryClient } from "@tanstack/react-query"
import { userApi, userKeys } from "@/shared/api/user"

export function useForceDeleteUserMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => userApi.forceDeleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all })
    },
  })
}
