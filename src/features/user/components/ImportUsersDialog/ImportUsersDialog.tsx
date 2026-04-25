'use client';

import { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@atlas/ui/dialog';
import { FieldError, FieldGroup } from '@atlas/ui/field';
import { Button } from '@atlas/ui/button';
import {
  useCancelImportMutation,
  useImportUsersMutation
} from '@/shared/queries/user';
import { formatFileSize } from '@/shared/utils/format-file-size';
import {
  userApi,
  userKeys,
  importStatusFromProgress,
  importStatusFromCompleted,
  subscribeToImport
} from '@/shared/api/user';
import { isEchoConfigured } from '@/shared/lib/echo';
import logger from '@/shared/lib/logger';
import { useImportProgressStore } from '@/shared/store/import-progress.store';
import { DownloadIcon, FileUpIcon } from 'lucide-react';
import { ImportFileDropZone } from './ImportFileDropZone';
import { ImportFileCard } from './ImportFileCard';

const log = logger('import-users-dialog');

const ACCEPTED_TYPES = '.csv,.txt,.xlsx,.xls';
const ACCEPTED_LABEL = 'CSV, XLSX or XLS files.';
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

const FILE_INPUT_ID = 'import-file';
const LABEL_ID = 'import-file-label';
const HINT_ID = 'import-file-hint';
const CONSTRAINTS_ID = 'import-file-constraints';

type ApiError = { message?: string; body?: { message?: string | string[] } };

function getErrorMessage(err: ApiError | undefined): string | null {
  if (!err) return null;
  const bodyMsg = Array.isArray(err.body?.message)
    ? err.body.message.join(', ')
    : err.body?.message;
  return err.message ?? bodyMsg ?? null;
}

export function ImportUsersDialog() {
  const [open, setOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [submittedImportId, setSubmittedImportId] = useState<number | null>(null);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const echoConfigured = isEchoConfigured();

  const importUsers = useImportUsersMutation();
  const cancelImport = useCancelImportMutation();
  const importError = getErrorMessage(importUsers.error as ApiError | undefined);
  const isPending = importUsers.isPending;

  const {
    data: status,
    isError: isStatusError,
    error: statusError,
    refetch: refetchStatus,
  } = useQuery({
    queryKey: userKeys.importStatus(submittedImportId ?? 0),
    queryFn: () => userApi.getImportStatus(submittedImportId!),
    enabled: submittedImportId != null,
    refetchInterval: echoConfigured
      ? false
      : (query) => {
        const s = query.state.data?.status;
        return s === 'pending' || s === 'processing' ? 2000 : false;
      },
  });

  useEffect(() => {
    if (submittedImportId == null || !echoConfigured) return;
    const importId = submittedImportId;
    log.debug('subscribing to import channel', {
      importId,
      channel: `imports.${importId}`,
    });
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
  }, [submittedImportId, echoConfigured, queryClient]);

  useEffect(() => {
    if (status?.status === 'completed' || status?.status === 'failed') {
      const timeoutId = window.setTimeout(() => {
        setOpen(false);
        setSubmittedImportId(null);
        setImportFile(null);
      }, 2000);
      return () => window.clearTimeout(timeoutId);
    }
  }, [status?.status]);

  function validateFile(file: File): string | null {
    if (file.size > MAX_SIZE_BYTES) {
      return `File size must be at most ${formatFileSize(MAX_SIZE_BYTES)}.`;
    }
    return null;
  }

  function setFile(file: File | null) {
    setImportFile(file);
    setFileError(file ? validateFile(file) : null);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile) return;
    const err = validateFile(importFile);
    if (err) {
      setFileError(err);
      return;
    }
    setFileError(null);
    importUsers.mutate(importFile, {
      onSuccess: (data) => {
        setSubmittedImportId(data.id);
      },
    });
  };

  const displayError = importError ?? fileError;

  const progressPercentage =
    status != null && Number.isFinite(status.progress_percentage)
      ? status.progress_percentage
      : null;

  const isImportInProgress =
    isPending ||
    (submittedImportId != null && status?.status !== 'completed');
  const canSubmitWhenIdle = Boolean(importFile) && !fileError;

  const setHideProgressCardInLayout = useImportProgressStore(
    (s) => s.setHideProgressCardInLayout
  );
  useEffect(() => {
    setHideProgressCardInLayout(open && isImportInProgress);
    return () => setHideProgressCardInLayout(false);
  }, [open, isImportInProgress, setHideProgressCardInLayout]);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setSubmittedImportId(null);
      setImportFile(null);
    }
  }

  function closeDialog() {
    setOpen(false);
    setSubmittedImportId(null);
    setImportFile(null);
  }

  function handleCancelClick() {
    if (submittedImportId != null) {
      cancelImport.mutate(submittedImportId, { onSettled: closeDialog });
    }
    else {
      closeDialog();
    }
  }

  async function handleDownloadTemplate() {
    setIsDownloadingTemplate(true);
    try {
      await userApi.downloadImportTemplate();
    }
    finally {
      setIsDownloadingTemplate(false);
    }
  }

  function handleRemoveFile() {
    if (submittedImportId != null) {
      cancelImport.mutate(submittedImportId, {
        onSettled: () => {
          setFile(null);
          setSubmittedImportId(null);
        },
      });
    }
    else {
      setFile(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
      >
        <FileUpIcon className="size-4" />
        Import CSV
      </Button>
      <DialogContent
        className="max-w-md"
        showCloseButton={true}
        aria-describedby={undefined}
      >
        <DialogHeader>
          <DialogTitle>Import users</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FieldGroup>
            {displayError != null && displayError !== '' && (
              <FieldError>{displayError}</FieldError>
            )}

            <ImportFileDropZone
              id={FILE_INPUT_ID}
              labelId={LABEL_ID}
              hintId={HINT_ID}
              constraintsId={CONSTRAINTS_ID}
              accept={ACCEPTED_TYPES}
              acceptedLabel={ACCEPTED_LABEL}
              disabled={isImportInProgress}
              onFileChange={setFile}
              inputRef={inputRef}
            />

            <button
              type="button"
              onClick={handleDownloadTemplate}
              disabled={isImportInProgress || isDownloadingTemplate}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit disabled:pointer-events-none disabled:opacity-50"
            >
              <DownloadIcon className="size-3.5" />
              {isDownloadingTemplate ? 'Downloading…' : 'Download CSV template'}
            </button>

            {importFile != null && (
              <>
                {isStatusError && (
                  <p className="text-xs text-destructive" role="alert">
                    {statusError instanceof Error
                      ? statusError.message
                      : 'Failed to load import status.'}
                    <button
                      type="button"
                      onClick={() => refetchStatus()}
                      className="ml-1 underline focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      Retry
                    </button>
                  </p>
                )}
                <ImportFileCard
                  file={importFile}
                  onRemove={handleRemoveFile}
                  progressPercentage={progressPercentage}
                  showProgress={isImportInProgress}
                  disabled={cancelImport.isPending}
                />
              </>
            )}
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelClick}
              disabled={cancelImport.isPending}
            >
              {cancelImport.isPending ? 'Cancelling…' : 'Cancel'}
            </Button>
            <Button type="submit" disabled={!canSubmitWhenIdle || isImportInProgress}>
              {isImportInProgress ? 'Importing…' : 'Import'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
