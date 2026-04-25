import { Button } from '@atlas/ui/button';
import { Input } from '@atlas/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@atlas/ui/tabs';
import { XIcon } from 'lucide-react';
import type { UserStatsDto } from '@/shared/api/user';

export type UsersTab = 'all' | 'deleted';

interface UsersFilterBarProps {
  activeTab: UsersTab;
  onTabChange: (tab: UsersTab) => void;
  searchInput: string;
  onSearchChange: (value: string) => void;
  onSearchClear: () => void;
  stats: UserStatsDto | undefined;
}

export function UsersFilterBar({
  activeTab,
  onTabChange,
  searchInput,
  onSearchChange,
  onSearchClear,
  stats,
}: UsersFilterBarProps) {
  return (
    <>
      <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as UsersTab)}>
        <TabsList variant="line">
          <TabsTrigger value="all">
            All
            {stats !== undefined && (
              <span className="ml-.5 tabular-nums">({stats.total_active})</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="deleted">
            Deleted
            {stats !== undefined && (
              <span className="ml-.5 tabular-nums">({stats.total_deleted})</span>
            )}
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
        <label className="flex min-w-0 flex-1 items-center gap-2">
          <span className="sr-only">Search by name or email</span>
          <Input
            type="search"
            placeholder="Search by name or email"
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search by name or email"
            className="max-w-sm"
          />
        </label>
        {searchInput.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onSearchClear}
            aria-label="Clear search"
          >
            <XIcon className="size-4" />
            Clear
          </Button>
        )}
      </div>
    </>
  );
}
