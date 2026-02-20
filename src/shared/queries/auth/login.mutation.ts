import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { LoginRequestDto } from "@/shared/api/auth"
import { authApi, authKeys } from "@/shared/api/auth"
import { setTokenCookie } from "@/shared/utils/token-cookie"

export function useLoginMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: LoginRequestDto) => authApi.login(payload),
    onSuccess: (data) => {
      setTokenCookie(data.token)
      queryClient.setQueryData(authKeys.me(), data.user)
    },
  })
}
