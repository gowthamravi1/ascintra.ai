"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  Building2,
  Settings,
  FileText,
  Shield,
  CreditCard,
  Bell,
  Activity,
  Database,
  User,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  Zap,
  GitBranch,
  BookOpen,
  LifeBuoy,
  BarChart3,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  children?: NavigationItem[]
}

const navigation: NavigationItem[] = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Tenants",
    href: "/admin/tenants",
    icon: Building2,
    badge: "12",
    children: [
      { name: "All Tenants", href: "/admin/tenants", icon: Building2 },
      { name: "Provision New", href: "/admin/tenants/provision", icon: Zap },
    ],
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: Users,
    badge: "247",
  },
  {
    name: "Service Operations",
    href: "/admin/service-ops",
    icon: Activity,
    badge: "3",
  },
  {
    name: "Integrations",
    href: "/admin/integrations",
    icon: Database,
    badge: "8",
  },
  {
    name: "Audit & Logs",
    href: "/admin/audit",
    icon: FileText,
  },
  {
    name: "Roles & Permissions",
    href: "/admin/roles",
    icon: Shield,
  },
  {
    name: "SCIM Provisioning",
    href: "/admin/scim",
    icon: GitBranch,
  },
  {
    name: "Billing",
    href: "/admin/billing",
    icon: CreditCard,
    children: [
      { name: "Plans & Pricing", href: "/admin/billing/plans", icon: CreditCard },
      { name: "Invoices", href: "/admin/billing/invoices", icon: FileText },
      { name: "Usage Analytics", href: "/admin/billing/usage", icon: BarChart3 },
    ],
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
    children: [
      { name: "Notifications", href: "/admin/settings/notifications", icon: Bell },
      { name: "SMTP Configuration", href: "/admin/settings/smtp", icon: Settings },
      { name: "Feature Flags", href: "/admin/settings/features", icon: Zap },
    ],
  },
  {
    name: "Documentation",
    href: "/admin/docs",
    icon: BookOpen,
  },
  {
    name: "Support",
    href: "/admin/support",
    icon: LifeBuoy,
  },
  {
    name: "System Status",
    href: "/admin/status",
    icon: Activity,
  },
]

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(true)
  const [expandedItems, setExpandedItems] = React.useState<string[]>([])

  const isActiveRoute = (href: string) => {
    if (href === "/admin/dashboard") {
      return pathname === "/admin" || pathname === "/admin/dashboard"
    }
    return pathname.startsWith(href)
  }

  const toggleExpanded = (itemName: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemName) ? prev.filter((name) => name !== itemName) : [...prev, itemName],
    )
  }

  const NavigationItems = ({ items, mobile = false }: { items: NavigationItem[]; mobile?: boolean }) => (
    <>
      {items.map((item) => {
        const isActive = isActiveRoute(item.href)
        const hasChildren = item.children && item.children.length > 0
        const isExpanded = expandedItems.includes(item.name)

        if (hasChildren) {
          return (
            <div key={item.name} className="space-y-1">
              {sidebarCollapsed && !mobile ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-12 h-12 p-0 flex items-center justify-center relative",
                        isActive ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                      )}
                      onClick={() => toggleExpanded(item.name)}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.badge && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="ml-2">
                    <p>{item.name}</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start px-3 py-2 h-auto",
                    isActive ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                  )}
                  onClick={() => toggleExpanded(item.name)}
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {(!sidebarCollapsed || mobile) && (
                    <>
                      <span className="flex-1 text-left">{item.name}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-2">
                          {item.badge}
                        </Badge>
                      )}
                      <ChevronRight className={cn("h-4 w-4 ml-2 transition-transform", isExpanded && "rotate-90")} />
                    </>
                  )}
                </Button>
              )}

              {isExpanded && (!sidebarCollapsed || mobile) && (
                <div className="ml-6 space-y-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.name}
                      href={child.href}
                      className={cn(
                        "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                        isActiveRoute(child.href)
                          ? "bg-blue-100 text-blue-700"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                      )}
                      onClick={() => mobile && setMobileMenuOpen(false)}
                    >
                      <child.icon className="mr-3 h-4 w-4 flex-shrink-0" />
                      {child.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )
        }

        if (sidebarCollapsed && !mobile) {
          return (
            <Tooltip key={item.name}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    "w-12 h-12 flex items-center justify-center rounded-md transition-colors relative",
                    isActive ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.badge && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="ml-2">
                <p>{item.name}</p>
              </TooltipContent>
            </Tooltip>
          )
        }

        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
              isActive ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
            )}
            onClick={() => mobile && setMobileMenuOpen(false)}
          >
            <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
            {(!sidebarCollapsed || mobile) && (
              <>
                {item.name}
                {item.badge && (
                  <Badge variant="secondary" className="ml-auto">
                    {item.badge}
                  </Badge>
                )}
              </>
            )}
          </Link>
        )
      })}
    </>
  )

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Desktop Sidebar */}
        <div
          className={cn(
            "hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col transition-all duration-300 ease-in-out",
            sidebarCollapsed ? "lg:w-16" : "lg:w-64",
          )}
        >
          <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white shadow-sm">
            {/* Logo */}
            <div
              className={cn(
                "flex h-16 flex-shrink-0 items-center border-b border-gray-200 transition-all duration-300",
                sidebarCollapsed ? "justify-center px-2" : "px-4",
              )}
            >
              <div className="flex items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                {!sidebarCollapsed && <span className="ml-2 text-xl font-bold text-gray-900">Ascintra.ai</span>}
              </div>
            </div>

            {/* Toggle Button */}
            <div
              className={cn(
                "flex items-center border-b border-gray-200 p-2",
                sidebarCollapsed ? "justify-center" : "justify-end",
              )}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="h-8 w-8 p-0"
              >
                {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </Button>
            </div>

            {/* Navigation */}
            <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
              <nav className={cn("flex-1 space-y-1", sidebarCollapsed ? "px-2" : "px-2")}>
                <NavigationItems items={navigation} />
              </nav>
            </div>

            {/* User Profile */}
            <div
              className={cn(
                "flex flex-shrink-0 border-t border-gray-200",
                sidebarCollapsed ? "p-2 justify-center" : "p-4",
              )}
            >
              {sidebarCollapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="w-12 h-12 p-0">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="/placeholder.svg?height=32&width=32" />
                            <AvatarFallback>AD</AvatarFallback>
                          </Avatar>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Admin User</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <User className="mr-2 h-4 w-4" />
                          Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Settings className="mr-2 h-4 w-4" />
                          Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Bell className="mr-2 h-4 w-4" />
                          Notifications
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <LogOut className="mr-2 h-4 w-4" />
                          Sign out
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="ml-2">
                    <p>Admin User</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="w-full justify-start p-0 h-auto">
                      <div className="flex items-center w-full">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="/placeholder.svg?height=32&width=32" />
                          <AvatarFallback>AD</AvatarFallback>
                        </Avatar>
                        <div className="ml-3 text-left">
                          <p className="text-sm font-medium text-gray-700">Admin User</p>
                          <p className="text-xs text-gray-500">admin@ascintra.ai</p>
                        </div>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Admin User</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Bell className="mr-2 h-4 w-4" />
                      Notifications
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="lg:hidden">
          <div className="flex items-center justify-between bg-white px-4 py-2 shadow-sm border-b border-gray-200">
            <div className="flex items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">Ascintra.ai Admin</span>
            </div>

            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="flex h-full flex-col">
                  {/* Mobile Logo */}
                  <div className="flex h-16 items-center px-4 border-b border-gray-200">
                    <div className="flex items-center">
                      <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600">
                        <Shield className="h-5 w-5 text-white" />
                      </div>
                      <span className="ml-2 text-xl font-bold text-gray-900">Ascintra.ai</span>
                    </div>
                  </div>

                  {/* Mobile Navigation */}
                  <div className="flex-1 overflow-y-auto pt-5 pb-4">
                    <nav className="flex-1 space-y-1 px-2">
                      <NavigationItems items={navigation} mobile />
                    </nav>
                  </div>

                  {/* Mobile User Profile */}
                  <div className="border-t border-gray-200 p-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="w-full justify-start p-0 h-auto">
                          <div className="flex items-center w-full">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src="/placeholder.svg?height=32&width=32" />
                              <AvatarFallback>AD</AvatarFallback>
                            </Avatar>
                            <div className="ml-3 text-left">
                              <p className="text-sm font-medium text-gray-700">Admin User</p>
                              <p className="text-xs text-gray-500">admin@ascintra.ai</p>
                            </div>
                          </div>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Admin User</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <User className="mr-2 h-4 w-4" />
                          Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Settings className="mr-2 h-4 w-4" />
                          Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Bell className="mr-2 h-4 w-4" />
                          Notifications
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <LogOut className="mr-2 h-4 w-4" />
                          Sign out
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Main Content */}
        <div className={cn("transition-all duration-300 ease-in-out", sidebarCollapsed ? "lg:pl-16" : "lg:pl-64")}>
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </TooltipProvider>
  )
}

export default AdminLayout
