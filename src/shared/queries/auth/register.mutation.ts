import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { RegisterRequestDto } from "@/shared/api/auth"
import { authApi, authKeys } from "@/shared/api/auth"
import { setTokenCookie } from "@/shared/utils/token-cookie"

export function useRegisterMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: RegisterRequestDto) => authApi.register(payload),
    onSuccess: (data) => {
      setTokenCookie(data.token)
      queryClient.setQueryData(authKeys.me(), data.user)
    },
  })
}
