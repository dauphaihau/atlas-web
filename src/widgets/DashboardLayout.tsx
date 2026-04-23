import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
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
  SidebarTrigger,
} from "@atlas/ui/sidebar"
import { Button } from "@atlas/ui/button"
import { ImportProgressCard } from "@/features/user"
import {
  Building2Icon,
  LayoutDashboardIcon,
  ListChecksIcon,
  LogOutIcon,
  SettingsIcon,
  UsersIcon,
} from "lucide-react"
import { AuthGuard } from "@/widgets/AuthGuard"
import { useImportProgressStore } from "@/shared/store/import-progress.store"
import { useMeQuery } from "@/shared/queries/auth"
import { useLogoutMutation } from "@/shared/queries/auth"

const navItems: Array<{
  to: string
  label: string
  icon: typeof LayoutDashboardIcon
  adminOnly?: boolean
  superAdminOnly?: boolean
}> = [
    { to: "/", label: "Dashboard", icon: LayoutDashboardIcon },
    { to: "/users", label: "Users", icon: UsersIcon },
    { to: "/tenants", label: "Tenants", icon: Building2Icon, superAdminOnly: true },
    { to: "/activity-logs", label: "Activity Logs", icon: ListChecksIcon, adminOnly: true },
    { to: "/settings", label: "Settings", icon: SettingsIcon },
  ]

export function DashboardLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { data: me } = useMeQuery()
  const logout = useLogoutMutation()
  const hideProgressCardInLayout = useImportProgressStore(
    (s) => s.hideProgressCardInLayout
  )

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
                  {navItems.map(({ to, label, icon: Icon, adminOnly, superAdminOnly }) => {
                    if (adminOnly && !me?.roles?.includes("admin")) return null
                    if (superAdminOnly && !me?.roles?.includes("super_admin")) return null
                    return (
                      <SidebarMenuItem key={to}>
                        <SidebarMenuButton
                          render={(props) => (
                            <Link to={to} {...props}>
                              <Icon />
                              <span>{label}</span>
                            </Link>
                          )}
                          isActive={location.pathname === to}
                        />
                      </SidebarMenuItem>
                    )
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
                onClick={() => logout.mutate(undefined, { onSuccess: () => navigate("/login", { replace: true }) })}
                disabled={logout.isPending}
              >
                <LogOutIcon className="size-4" />
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
  )
}
