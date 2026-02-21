import { useQuery } from "@tanstack/react-query"
import { authApi, authKeys } from "@/shared/api/auth"

export function useMeQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: () => {
      return authApi.me()
    },
    retry: (failureCount, error) => {
      const err = error as { status?: number }
      if (err.status === 401) return false
      return failureCount < 1
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  })
}
