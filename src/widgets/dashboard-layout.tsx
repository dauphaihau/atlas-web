import { useRef } from 'react';
import {
  Link, Outlet, useLocation, useNavigate
} from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger
} from '@atlas/ui/sidebar';
import { Button } from '@atlas/ui/button';
import { ImportProgressCard } from '@/features/user';
import {
  BlocksIcon,
  LayoutPanelTopIcon,
  LogoutIcon,
  SettingsIcon,
  SquareActivityIcon,
  UsersIcon
} from 'lucide-animated';
import { AuthGuard } from '@/widgets/auth-guard';
import { useImportProgressStore } from '@/shared/store/import-progress.store';
import { useMeQuery } from '@/shared/queries/auth';
import { useLogoutMutation } from '@/shared/queries/auth';

interface AnimatedIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

function NavItem({
  to, label, icon: Icon, isActive, 
}: {
  to: string;
  label: string;
  icon: typeof SettingsIcon;
  isActive: boolean;
}) {
  const iconRef = useRef<AnimatedIconHandle>(null);
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        render={(props) => (
          <Link
            to={to}
            {...props}
            onMouseEnter={() => iconRef.current?.startAnimation()}
            onMouseLeave={() => iconRef.current?.stopAnimation()}
          >
            <Icon ref={iconRef} />
            <span>{label}</span>
          </Link>
        )}
        isActive={isActive}
        className="transition-colors duration-150"
      />
    </SidebarMenuItem>
  );
}

const navItems: Array<{
  to: string
  label: string
  icon: typeof SettingsIcon
  adminOnly?: boolean
  superAdminOnly?: boolean
}> = [
  { to: '/', label: 'Dashboard', icon: LayoutPanelTopIcon },
  { to: '/users', label: 'Users', icon: UsersIcon },
  {
    to: '/tenants', label: 'Tenants', icon: BlocksIcon, superAdminOnly: true,
  },
  {
    to: '/activity-logs', label: 'Activity Logs', icon: SquareActivityIcon, adminOnly: true,
  },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
];

export function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: me } = useMeQuery();
  const logout = useLogoutMutation();
  const hideProgressCardInLayout = useImportProgressStore(
    (state) => state.hideProgressCardInLayout
  );

  return (
    <AuthGuard>
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <span className="font-semibold text-sidebar-foreground px-2 text-2xl">
              Atlas
            </span>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-2">
                  {navItems.map(({
                    to, label, icon, adminOnly, superAdminOnly, 
                  }) => {
                    if (adminOnly && !me?.roles?.includes('admin')) return null;
                    if (superAdminOnly && !me?.roles?.includes('super_admin')) return null;
                    return (
                      <NavItem
                        key={to}
                        to={to}
                        label={label}
                        icon={icon}
                        isActive={location.pathname === to}
                      />
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <SidebarInset className="min-h-0">
          {!hideProgressCardInLayout && (
            <div className="fixed top-4 right-4 z-50">
              <ImportProgressCard />
            </div>
          )}

          <header className="sticky top-0 z-10 flex h-12 shrink-0 items-center gap-2 border-b border-border bg-background px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="ml-auto flex items-center gap-2">
              {me && (
                <span className="text-muted-foreground text-sm truncate max-w-[120px]" title={me.email}>
                  {me.email}
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => logout.mutate(undefined, { onSuccess: () => navigate('/login', { replace: true }) })}
                disabled={logout.isPending}
              >
                <LogoutIcon className="size-4" />
                <span className="sr-only">Log out</span>
              </Button>
            </div>
          </header>

          <main className="flex min-h-0 flex-1 flex-col overflow-hidden p-4">
            <div className="flex min-h-0 flex-1 flex-col">
              <Outlet />
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  );
}
