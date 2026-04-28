export type ApiError = {
  message?: string
  status?: number
  body?: { message?: string | string[]; error_code?: string }
}

export function getErrorMessage(err: ApiError | undefined): string | null {
  if (!err) return null;
  const bodyMsg = Array.isArray(err.body?.message)
    ? err.body.message.join(', ')
    : err.body?.message;
  return err.message ?? bodyMsg ?? null;
}

export function isVersionConflict(err: ApiError | undefined): boolean {
  return err?.status === 409 || err?.body?.error_code === 'VERSION_CONFLICT';
}
