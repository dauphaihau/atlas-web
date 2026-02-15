import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/shared/ui/sidebar"
import { Button } from "@/shared/ui/button"
import { LayoutDashboard, LogOut, Settings, Users } from "lucide-react"
import { AuthGuard } from "@/widgets/AuthGuard"
import { useMeQuery } from "@/shared/queries/auth"
import { useLogoutMutation } from "@/shared/queries/auth"

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/users", label: "Users", icon: Users },
  { to: "/settings", label: "Settings", icon: Settings },
] as const

export function DashboardLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { data: me } = useMeQuery()
  const logout = useLogoutMutation()

  return (
    <AuthGuard>
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader className="border-b border-sidebar-border">
            <span className="font-semibold text-sidebar-foreground px-2">
              Admin
            </span>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map(({ to, label, icon: Icon }) => (
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
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <SidebarInset>
          <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-4">
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
                <LogOut className="size-4" />
                <span className="sr-only">Log out</span>
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4">
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  )
}
