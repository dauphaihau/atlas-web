import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { CreateUserRequestDto } from "@/shared/api/user"
import { userApi, userKeys } from "@/shared/api/user"

export function useCreateUserMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateUserRequestDto) => userApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all })
    },
  })
}
