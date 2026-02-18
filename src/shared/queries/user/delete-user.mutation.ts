import { useMutation, useQueryClient } from "@tanstack/react-query"
import { userApi, userKeys } from "@/shared/api/user"

export function useDeleteUserMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => userApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all })
    },
  })
}
