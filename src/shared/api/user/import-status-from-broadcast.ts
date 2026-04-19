import type { ImportStatusDto } from "./dto"
import type {
  ImportCompletedPayload,
  ImportProgressPayload,
} from "./import-events"

/**
 * Maps ImportProgressUpdated broadcast payload to ImportStatusDto-like object
 * for React Query cache (status = 'processing').
 */
export function importStatusFromProgress(
  importId: number,
  payload: ImportProgressPayload
): ImportStatusDto {
  return {
    id: importId,
    status: "processing",
    total_rows: payload.totalRows,
    processed_rows: payload.processedRows,
    progress_percentage: payload.progressPercentage,
    created: payload.createdCount,
    updated: payload.updatedCount,
    errors: [],
    started_at: null,
    completed_at: null,
  }
}

/**
 * Maps ImportCompleted broadcast payload to ImportStatusDto for React Query cache.
 */
export function importStatusFromCompleted(
  importId: number,
  payload: ImportCompletedPayload
): ImportStatusDto {
  return {
    id: importId,
    status: payload.status,
    total_rows: payload.totalRows,
    processed_rows: payload.processedRows,
    progress_percentage: payload.status === "completed" ? 100 : 0,
    created: payload.createdCount,
    updated: payload.updatedCount,
    errors: payload.errors ?? [],
    started_at: null,
    completed_at: null,
  }
}
