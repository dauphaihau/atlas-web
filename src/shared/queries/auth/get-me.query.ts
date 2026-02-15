import { useQuery } from "@tanstack/react-query"
import { authApi, authKeys } from "@/shared/api/auth"

export function useMeQuery() {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: () => authApi.me(),
    retry: (failureCount, error) => {
      const err = error as { status?: number }
      if (err.status === 401) return false
      return failureCount < 1
    },
    staleTime: 5 * 60 * 1000,
  })
}
