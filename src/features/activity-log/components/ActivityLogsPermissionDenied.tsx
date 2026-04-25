export function ActivityLogsPermissionDenied() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Activity Logs</h1>
      <p className="text-muted-foreground" role="alert">
        You do not have permission to view activity logs.
      </p>
    </div>
  );
}
