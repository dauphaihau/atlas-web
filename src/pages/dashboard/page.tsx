import { Button } from '@atlas/ui/button';

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to the admin dashboard.
        </p>
      </div>
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="text-sm text-muted-foreground">
          Use the sidebar to navigate. Stack: Vite, React, TypeScript, shadcn
          (Base UI), Zustand, React Query, React Router.
        </p>
        <Button className="mt-3" size="sm">
          Get started
        </Button>
      </div>
    </div>
  );
}
