import { useMutation, useQueryClient } from "@tanstack/react-query"
import { authApi, authKeys } from "@/shared/api/auth"
import { clearTokenCookie } from "@/shared/utils/get-token-cookie-name"

export function useLogoutMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      clearTokenCookie()
      queryClient.removeQueries({ queryKey: authKeys.all })
    },
  })
}
