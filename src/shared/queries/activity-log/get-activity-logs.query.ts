import type { ListActivityLogsParams } from "@/shared/api/activity-log"
import { activityLogApi, activityLogKeys } from "@/shared/api/activity-log"
import { useQuery } from "@tanstack/react-query"

export function useActivityLogsQuery(params?: ListActivityLogsParams) {
  return useQuery({
    queryKey: activityLogKeys.list(params),
    queryFn: () => activityLogApi.list(params),
  })
}
