import { getEcho } from '@/shared/lib/echo';
import logger from '@/shared/lib/logger';

const log = logger('user-import-subscription');

/** Payload broadcast by ImportProgressUpdated (camelCase from Laravel). */
export interface ImportProgressPayload {
  importId: number
  totalRows: number
  processedRows: number
  createdCount: number
  updatedCount: number
  errorCount: number
  progressPercentage: number
}

/** Payload broadcast by ImportCompleted (camelCase from Laravel). */
export interface ImportCompletedPayload {
  importId: number
  status: string
  totalRows: number
  processedRows: number
  createdCount: number
  updatedCount: number
  errors: Array<{ row: number; message: string }>
}

export type ImportProgressListener = (payload: ImportProgressPayload) => void;
export type ImportCompletedListener = (payload: ImportCompletedPayload) => void;

export interface SubscribeToImportCallbacks {
  onProgress: ImportProgressListener
  onCompleted: ImportCompletedListener
}

export function subscribeToImport(
  importId: number,
  callbacks: SubscribeToImportCallbacks
): () => void {
  const echo = getEcho();
  if (echo == null) {
    return () => {};
  }

  const channelName = `imports.${importId}`;
  const channel = echo.private(channelName);

  log.debug('subscribing to import channel', {
    importId,
    channel: channelName,
  });

  channel.subscribed(() => {
    log.debug('import channel subscribed', {
      importId,
      channel: channelName,
    });
  });

  channel.error((error: unknown) => {
    log.error('import channel subscription error', {
      importId,
      channel: channelName,
      error,
    });
  });

  // Laravel broadcastAs() event names are listened with a leading dot.
  channel.listen('.import.progress', (e: ImportProgressPayload) => {
    callbacks.onProgress(e);
  });
  channel.listen('.import.completed', (e: ImportCompletedPayload) => {
    callbacks.onCompleted(e);
  });

  return () => {
    log.debug('leaving import channel', {
      importId,
      channel: channelName,
    });
    echo.leave(channelName);
  };
}
