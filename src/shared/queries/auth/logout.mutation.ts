import { useMutation, useQueryClient } from "@tanstack/react-query"
import { authApi, authKeys } from "@/shared/api/auth"
import { clearEtagCache } from "@/shared/lib/api-client"
import { clearTokenCookie } from "@/shared/utils/get-token-cookie-name"

export function useLogoutMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      clearTokenCookie()
      clearEtagCache()
      queryClient.removeQueries({ queryKey: authKeys.all })
    },
  })
}
