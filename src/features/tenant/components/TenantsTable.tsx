import { useState, useCallback } from 'react';
import {
  useTenantsQuery,
  useDeleteTenantMutation
} from '@/shared/queries/tenant';
import type { TenantDto } from '@/shared/api/tenant';
import { Skeleton } from '@atlas/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@atlas/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious
} from '@atlas/ui/pagination';
import { Button } from '@atlas/ui/button';
import { MoreVerticalIcon, PencilIcon, Trash2Icon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@atlas/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@atlas/ui/alert-dialog';
import { EditTenantDialog } from './EditTenantDialog';

const DEFAULT_PER_PAGE = 15;
const PER_PAGE_OPTIONS = [10, 15, 25, 50] as const;

function formatDate(value: string | null | undefined): string {
  if (value == null || value === '') return '—';
  try {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? value : d.toLocaleString();
  }
  catch {
    return value;
  }
}

export interface TenantsTableProps {
  onEdit?: (tenant: TenantDto) => void
}

export function TenantsTable({ onEdit }: TenantsTableProps) {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState<typeof PER_PAGE_OPTIONS[number]>(
    DEFAULT_PER_PAGE
  );
  const [tenantToEdit, setTenantToEdit] = useState<TenantDto | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState<TenantDto | null>(null);

  const tenantsQuery = useTenantsQuery({ page, per_page: perPage });
  const deleteTenantMutation = useDeleteTenantMutation();

  const tenants = tenantsQuery.data?.data ?? [];
  const meta = tenantsQuery.data?.meta;
  const total = meta?.total ?? 0;
  const currentPage = meta?.current_page ?? page;
  const totalPages =
    meta && meta.per_page > 0 ? Math.ceil(meta.total / meta.per_page) : 1;
  const from =
    total === 0 ? 0 : ((currentPage - 1) * (meta?.per_page ?? perPage)) + 1;
  const to =
    total === 0
      ? 0
      : Math.min(currentPage * (meta?.per_page ?? perPage), total);

  const goToPrev = useCallback(() => {
    setPage((p) => Math.max(1, p - 1));
  }, []);
  const goToNext = useCallback(() => {
    setPage((p) => Math.min(totalPages, p + 1));
  }, [totalPages]);

  const handlePerPageChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = Number(e.target.value);
      if (
        Number.isInteger(value) &&
        (PER_PAGE_OPTIONS as readonly number[]).includes(value)
      ) {
        setPerPage(value as typeof PER_PAGE_OPTIONS[number]);
        setPage(1);
      }
    },
    []
  );

  const handleEditClick = useCallback(
    (tenant: TenantDto) => {
      setTenantToEdit(tenant);
      setEditDialogOpen(true);
      onEdit?.(tenant);
    },
    [onEdit]
  );

  const handleDeleteConfirm = useCallback(() => {
    if (tenantToDelete == null) return;
    deleteTenantMutation.mutate(tenantToDelete.id, {
      onSettled: () => setTenantToDelete(null),
    });
  }, [tenantToDelete, deleteTenantMutation]);

  const err = tenantsQuery.error as
    | { status?: number; message?: string }
    | undefined;
  const isForbidden = err?.status === 403;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      {isForbidden && (
        <p className="shrink-0 text-destructive text-sm" role="alert">
          Access denied. Only super admins can manage tenants.
        </p>
      )}

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-border">
        {tenantsQuery.isLoading
          ? (
            <div className="space-y-3 p-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          )
          : tenantsQuery.isError && !isForbidden
            ? (
              <div className="p-4 text-destructive text-sm">
                {tenantsQuery.error instanceof Error
                  ? tenantsQuery.error.message
                  : 'Failed to load tenants.'}
              </div>
            )
            : tenants.length === 0
              ? (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  No tenants yet. Add a tenant to get started.
                </div>
              )
              : (
                <div className="min-h-0 flex-1 overflow-auto">
                  <Table>
                    <TableHeader className="sticky top-0 z-[1] bg-muted/50 [&_tr]:border-b [&_th]:bg-muted/50 [&_th]:shadow-[0_1px_0_0_hsl(var(--border))]">
                      <TableRow className="border-b border-border hover:bg-muted/50">
                        <TableHead scope="col">Name</TableHead>
                        <TableHead scope="col">Slug</TableHead>
                        <TableHead scope="col">Active</TableHead>
                        <TableHead scope="col">Created</TableHead>
                        <TableHead scope="col" className="w-0 text-right">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tenants.map((tenant) => (
                        <TableRow key={tenant.id}>
                          <TableCell className="font-medium">{tenant.name}</TableCell>
                          <TableCell className="text-muted-foreground font-mono text-sm">
                            {tenant.slug}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {tenant.is_active ? 'Yes' : 'No'}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(tenant.created_at)}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                render={
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    aria-label="Open actions menu"
                                  />
                                }
                              >
                                <MoreVerticalIcon className="size-4" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleEditClick(tenant)}
                                >
                                  <PencilIcon className="size-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  variant="destructive"
                                  onClick={() => setTenantToDelete(tenant)}
                                >
                                  <Trash2Icon className="size-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
      </div>

      {!tenantsQuery.isLoading &&
        !tenantsQuery.isError &&
        total > 0 && (
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4 text-muted-foreground text-sm">
            <span>
              Showing {from}–{to} of {total}
            </span>
            <label className="flex items-center gap-2">
              <span>Per page</span>
              <select
                value={perPage}
                onChange={handlePerPageChange}
                className="h-8 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label="Tenants per page"
              >
                {PER_PAGE_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <Pagination
            className="mx-0 w-auto"
            aria-label="Tenants table pagination"
          >
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={goToPrev}
                  disabled={currentPage <= 1}
                />
              </PaginationItem>
              <PaginationItem>
                <span className="px-2 text-muted-foreground text-sm">
                  Page {currentPage} of {totalPages}
                </span>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  onClick={goToNext}
                  disabled={currentPage >= totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <EditTenantDialog
        tenant={tenantToEdit}
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) setTenantToEdit(null);
        }}
      />

      <AlertDialog
        open={tenantToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setTenantToDelete(null);
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete tenant?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{' '}
              {tenantToDelete?.name ?? 'this tenant'}. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteTenantMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteTenantMutation.isPending}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
