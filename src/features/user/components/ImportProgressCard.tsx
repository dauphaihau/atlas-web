'use client';

import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FileTextIcon, XIcon } from 'lucide-react';
import {
  userApi,
  userKeys,
  importStatusFromProgress,
  importStatusFromCompleted,
  subscribeToImport
} from '@/shared/api/user';
import { useImportProgressStore } from '@/shared/store/import-progress.store';
import { formatFileSize } from '@/shared/utils/format-file-size';
import { cn } from '@/shared/lib/utils';
import { Button } from '@atlas/ui/button';
import { Progress } from '@atlas/ui/progress';
import { isEchoConfigured } from '@/shared/lib/echo';

export function ImportProgressCard() {
  const activeImport = useImportProgressStore((s) => s.activeImport);
  const clearActiveImport = useImportProgressStore((s) => s.clearActiveImport);
  const queryClient = useQueryClient();
  const echoConfigured = isEchoConfigured();

  const {
    data: status,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: userKeys.importStatus(activeImport?.id ?? 0),
    queryFn: () => userApi.getImportStatus(activeImport!.id),
    enabled: activeImport != null,
    // When Echo is configured, progress comes via WebSockets; otherwise fall back to polling
    refetchInterval: echoConfigured
      ? false
      : (query) => {
        const s = query.state.data?.status;
        return s === 'pending' || s === 'processing' ? 2000 : false;
      },
  });

  // Subscribe to WebSocket for real-time progress when Echo is configured
  useEffect(() => {
    if (activeImport == null || !echoConfigured) return;
    const importId = activeImport.id;
    const unsubscribe = subscribeToImport(importId, {
      onProgress: (payload) => {
        queryClient.setQueryData(userKeys.importStatus(importId), (old: { progress_percentage?: number } | undefined) => {
          const next = importStatusFromProgress(importId, payload);
          const incoming = payload?.progressPercentage;
          const current: number = old != null && Number.isFinite(old.progress_percentage) ? (old.progress_percentage as number) : -1;
          if (Number.isFinite(incoming) && incoming < current) return old;
          return next;
        });
      },
      onCompleted: (payload) => {
        queryClient.setQueryData(
          userKeys.importStatus(importId),
          importStatusFromCompleted(importId, payload)
        );
        queryClient.invalidateQueries({ queryKey: userKeys.all });
      },
    });
    return unsubscribe;
  }, [activeImport, echoConfigured, queryClient]);

  useEffect(() => {
    if (status?.status === 'completed') {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    }
  }, [status?.status, queryClient]);

  // Auto-hide card 8s after progress reaches 100%
  useEffect(() => {
    if (activeImport == null || status?.status !== 'completed') return;
    const timeoutId = window.setTimeout(() => {
      clearActiveImport();
    }, 8000);
    return () => window.clearTimeout(timeoutId);
  }, [activeImport, status?.status, clearActiveImport]);

  if (activeImport == null) return null;

  const displayName = activeImport.fileName.trim() || 'Import';
  const displaySize =
    activeImport.fileSize != null && activeImport.fileSize >= 0
      ? formatFileSize(activeImport.fileSize)
      : '—';
  const percentage =
    status != null && Number.isFinite(status.progress_percentage)
      ? status.progress_percentage
      : 0;

  return (
    <div
      className={cn(
        'flex w-full max-w-sm flex-col gap-2 rounded-lg border border-border bg-card p-3 text-card-foreground shadow-sm'
      )}
      role="status"
      aria-live="polite"
      aria-label={`Import ${displayName}: ${percentage}%`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-start gap-2">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <FileTextIcon className="size-4" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {displayName}
            </p>
            <p className="text-xs text-muted-foreground">({displaySize})</p>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={() => clearActiveImport()}
          aria-label="Dismiss import progress"
          className="shrink-0"
        >
          <XIcon className="size-3" />
        </Button>
      </div>

      {isLoading && !status && (
        <p className="text-xs text-muted-foreground">Checking status…</p>
      )}

      {isError && (
        <p className="text-xs text-destructive" role="alert">
          {error instanceof Error ? error.message : 'Failed to load import status.'}
          <button
            type="button"
            onClick={() => refetch()}
            className="ml-1 underline focus:outline-none focus:ring-2 focus:ring-ring"
          >
            Retry
          </button>
        </p>
      )}

      {status != null && !isError && (
        <>
          <div className="flex items-center gap-2">
            <Progress value={percentage} className="flex-1" />
            <span className="shrink-0 text-sm tabular-nums text-foreground">
              {Math.round(percentage)}%
            </span>
          </div>
          {status.status === 'failed' && status.errors?.length > 0 && (
            <p className="text-xs text-destructive" role="alert">
              {status.errors[0]?.message ?? 'Import failed.'}
            </p>
          )}
          {status.status === 'completed' && (
            <p className="text-xs text-muted-foreground">
              Completed. {status.created} created, {status.updated} updated.
            </p>
          )}
        </>
      )}
    </div>
  );
}
