import { useQuery } from "@tanstack/react-query"
import { userApi, userKeys } from "@/shared/api/user"

export function useUserStatsQuery() {
  return useQuery({
    queryKey: userKeys.stats(),
    queryFn: () => userApi.getStats(),
  })
}
