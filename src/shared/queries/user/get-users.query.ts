import { useQuery } from "@tanstack/react-query"
import { userApi, userKeys } from "@/shared/api/user"

export function useUsersQuery() {
  return useQuery({
    queryKey: userKeys.list(),
    queryFn: () => userApi.list(),
  })
}
