import { useState, useCallback } from 'react';
import {
  useUsersQuery,
  useUpdateUserAvatarMutation,
  useDeleteUserMutation,
  useRestoreUserMutation,
  useForceDeleteUserMutation,
  useUserStatsQuery
} from '@/shared/queries/user';
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value';
import type { UserDto } from '@/shared/api/user';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@atlas/ui/dropdown-menu';
import { Button } from '@atlas/ui/button';
import {
  MoreVerticalIcon, PencilIcon, Trash2Icon, RotateCcwIcon 
} from 'lucide-react';
import { AvatarCell } from './AvatarCell';
import { TablePagination, PER_PAGE_OPTIONS } from './TablePagination';
import { UsersFilterBar } from './UsersFilterBar';
import { DeleteUserDialog } from './DeleteUserDialog';
import { ForceDeleteUserDialog } from './ForceDeleteUserDialog';
import type { UsersTab } from './UsersFilterBar';

const SEARCH_DEBOUNCE_MS = 300;

export interface UsersTableProps {
  onEdit?: (user: UserDto) => void;
  onDelete?: (user: UserDto) => void;
}

export function UsersTable({ onEdit, onDelete }: UsersTableProps) {
  const [activeTab, setActiveTab] = useState<UsersTab>('all');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState<typeof PER_PAGE_OPTIONS[number]>(PER_PAGE_OPTIONS[0]);
  const [searchInput, setSearchInput] = useState('');
  const [userToDelete, setUserToDelete] = useState<UserDto | null>(null);
  const [userToForceDelete, setUserToForceDelete] = useState<UserDto | null>(null);

  const debouncedSearch = useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS);
  const effectiveSearch = debouncedSearch.trim() || undefined;

  const usersQuery = useUsersQuery({
    page,
    per_page: perPage,
    search: effectiveSearch,
    trashed: activeTab === 'deleted' ? 'only' : undefined,
  });
  const statsQuery = useUserStatsQuery();
  const updateAvatar = useUpdateUserAvatarMutation();
  const deleteUserMutation = useDeleteUserMutation();
  const restoreUserMutation = useRestoreUserMutation();
  const forceDeleteUserMutation = useForceDeleteUserMutation();

  const users = usersQuery.data?.data ?? [];
  const meta = usersQuery.data?.meta;
  const total = meta?.total ?? 0;
  const currentPage = meta?.current_page ?? page;
  const totalPages = meta && meta.per_page > 0 ? Math.ceil(meta.total / meta.per_page) : 1;
  const from = total === 0 ? 0 : ((currentPage - 1) * (meta?.per_page ?? perPage)) + 1;
  const to = total === 0 ? 0 : Math.min(currentPage * (meta?.per_page ?? perPage), total);

  const goToPrev = useCallback(() => setPage((prev) => Math.max(1, prev - 1)), []);
  const goToNext = useCallback(
    () => setPage((prev) => Math.min(totalPages, prev + 1)),
    [totalPages]
  );

  const handlePerPageChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = Number(event.target.value);
    if (Number.isInteger(value) && (PER_PAGE_OPTIONS as readonly number[]).includes(value)) {
      setPerPage(value as typeof PER_PAGE_OPTIONS[number]);
      setPage(1);
    }
  }, []);

  const handleTabChange = useCallback((tab: UsersTab) => {
    setActiveTab(tab);
    setPage(1);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
    setPage(1);
  }, []);

  const handleSearchClear = useCallback(() => {
    setSearchInput('');
    setPage(1);
  }, []);

  const handleSoftDeleteConfirm = useCallback(() => {
    if (!userToDelete) return;
    deleteUserMutation.mutate(userToDelete.id, {
      onSettled: () => setUserToDelete(null),
      onSuccess: () => onDelete?.(userToDelete),
    });
  }, [userToDelete, deleteUserMutation, onDelete]);

  const handleForceDeleteConfirm = useCallback(() => {
    if (!userToForceDelete) return;
    forceDeleteUserMutation.mutate(userToForceDelete.id, {
      onSettled: () => setUserToForceDelete(null),
    });
  }, [userToForceDelete, forceDeleteUserMutation]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <UsersFilterBar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        searchInput={searchInput}
        onSearchChange={handleSearchChange}
        onSearchClear={handleSearchClear}
        stats={statsQuery.data}
      />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-border">
        {usersQuery.isLoading
          ? (
            <div className="space-y-3 p-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          )
          : usersQuery.isError
            ? (
              <div className="p-4 text-destructive text-sm">
                {usersQuery.error instanceof Error
                  ? usersQuery.error.message
                  : 'Failed to load users.'}
              </div>
            )
            : users.length === 0
              ? (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  {effectiveSearch
                    ? 'No users match your search.'
                    : activeTab === 'deleted'
                      ? 'No deleted users.'
                      : 'No users yet. Add a user or import from CSV.'}
                </div>
              )
              : (
                <div className="min-h-0 flex-1 overflow-auto">
                  <Table>
                    <TableHeader className="sticky top-0 z-[1] bg-muted/50 [&_tr]:border-b [&_th]:bg-muted/50 [&_th]:shadow-[0_1px_0_0_hsl(var(--border))]">
                      <TableRow className="border-b border-border hover:bg-muted/50">
                        <TableHead scope="col">Avatar</TableHead>
                        <TableHead scope="col">Name</TableHead>
                        <TableHead scope="col">Email</TableHead>
                        <TableHead scope="col">Created</TableHead>
                        <TableHead scope="col">Deleted</TableHead>
                        <TableHead scope="col" className="w-0 text-right">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <AvatarCell
                              user={user}
                              onUpload={(userId, file) => updateAvatar.mutate({ userId, file })}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell className="text-muted-foreground">{user.email}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {user.created_at ?? '—'}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {user.deleted_at ?? '—'}
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
                                {activeTab === 'all'
                                  ? (
                                    <>
                                      <DropdownMenuItem onClick={() => onEdit?.(user)}>
                                        <PencilIcon className="size-4" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        variant="destructive"
                                        onClick={() => setUserToDelete(user)}
                                      >
                                        <Trash2Icon className="size-4" />
                                        Delete
                                      </DropdownMenuItem>
                                    </>
                                  )
                                  : (
                                    <>
                                      <DropdownMenuItem
                                        onClick={() => restoreUserMutation.mutate(user.id)}
                                        disabled={restoreUserMutation.isPending}
                                      >
                                        <RotateCcwIcon className="size-4" />
                                        Restore
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        variant="destructive"
                                        onClick={() => setUserToForceDelete(user)}
                                        disabled={forceDeleteUserMutation.isPending}
                                      >
                                        <Trash2Icon className="size-4" />
                                        Permanently Delete
                                      </DropdownMenuItem>
                                    </>
                                  )}
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

      {!usersQuery.isLoading && !usersQuery.isError && total > 0 && (
        <TablePagination
          from={from}
          to={to}
          total={total}
          perPage={perPage}
          onPerPageChange={handlePerPageChange}
          currentPage={currentPage}
          totalPages={totalPages}
          onPrev={goToPrev}
          onNext={goToNext}
          ariaLabel="Users table pagination"
        />
      )}

      <DeleteUserDialog
        user={userToDelete}
        isPending={deleteUserMutation.isPending}
        onConfirm={handleSoftDeleteConfirm}
        onClose={() => setUserToDelete(null)}
      />

      <ForceDeleteUserDialog
        user={userToForceDelete}
        isPending={forceDeleteUserMutation.isPending}
        onConfirm={handleForceDeleteConfirm}
        onClose={() => setUserToForceDelete(null)}
      />
    </div>
  );
}
