/** Single activity log entry (GET activity-logs, activity-logs/:id). */
export interface ActivityLogEntryDto {
  id: number
  log_name: string | null
  event: string
  subject_type: string | null
  subject_id: string | null
  causer_type: string | null
  causer_id: string | null
  causer_name: string | null
  causer_email: string | null
  properties: Record<string, unknown> | null
  created_at: string
}

/** GET /v1/activity-logs query params. */
export interface ListActivityLogsParams {
  page?: number
  per_page?: number
  event?: string
  subject_type?: string
  subject_id?: number
  causer_id?: number
  from_date?: string
  to_date?: string
  sort?: string
}

/** GET /v1/activity-logs response (paginated). */
export interface ListActivityLogsResponseDto {
  data: ActivityLogEntryDto[]
  meta: {
    total: number
    per_page: number
    current_page: number
  }
}
