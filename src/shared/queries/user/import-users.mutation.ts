import { useMutation, useQueryClient } from "@tanstack/react-query"
import { userApi, userKeys } from "@/shared/api/user"

export function useImportUsersMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => userApi.importUsers(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all })
    },
  })
}
