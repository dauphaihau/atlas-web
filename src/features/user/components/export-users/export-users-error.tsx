'use client';

import { useExportUsersMutation } from '@/shared/queries/user';
import type { ApiError } from './types';
import { getExportErrorMessage } from './utils';

export function ExportUsersError() {
  const exportUsers = useExportUsersMutation();
  const exportError = getExportErrorMessage(
    exportUsers.error as ApiError | undefined
  );

  if (exportError == null || exportError === '') return null;

  return (
    <p className="text-destructive shrink-0 text-sm" role="alert">
      {exportError}
    </p>
  );
}
