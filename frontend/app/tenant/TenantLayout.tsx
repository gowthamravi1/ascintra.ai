"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Search,
  Shield,
  Activity,
  FileText,
  Settings,
  Brain,
  Users,
  AlertTriangle,
  TrendingUp,
  Database,
  Zap,
  CheckCircle,
  User,
  Bell,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  Map,
  TestTube,
  GitBranch,
  BarChart3,
  Eye,
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
    name: "Overview",
    href: "/tenant/overview",
    icon: LayoutDashboard,
  },
  {
    name: "Discovery",
    href: "/tenant/discovery",
    icon: Search,
    children: [
      { name: "Connect Sources", href: "/tenant/discovery/connect", icon: Zap },
      { name: "Discovery History", href: "/tenant/discovery/history", icon: FileText },
    ],
  },
  {
    name: "Inventory",
    href: "/tenant/inventory",
    icon: Database,
    badge: "1,247",
    children: [
      { name: "All Assets", href: "/tenant/inventory", icon: Database },
      { name: "Coverage Analysis", href: "/tenant/inventory/coverage", icon: Eye },
      { name: "Asset Details", href: "/tenant/inventory/details", icon: FileText },
    ],
  },
  {
    name: "Recovery Posture",
    href: "/tenant/posture",
    icon: Shield,
    badge: "87%",
    children: [
      { name: "Scorecard", href: "/tenant/posture/scorecard", icon: BarChart3 },
      { name: "RTO/RPO Analysis", href: "/tenant/posture/rto-rpo", icon: TrendingUp },
      { name: "Trends", href: "/tenant/posture/trends", icon: TrendingUp },
      { name: "Posture Map", href: "/tenant/posture/map", icon: Map },
    ],
  },
  {
    name: "Recovery Testing",
    href: "/tenant/recovery-testing",
    icon: TestTube,
    badge: "5",
    children: [
      { name: "Test Dashboard", href: "/tenant/recovery-testing/dashboard", icon: LayoutDashboard },
      { name: "Test Simulator", href: "/tenant/recovery-testing/simulator", icon: TestTube },
    ],
  },
  {
    name: "Configuration Drift",
    href: "/tenant/drift",
    icon: GitBranch,
    badge: "12",
    children: [
      { name: "Drift Overview", href: "/tenant/drift/overview", icon: LayoutDashboard },
      { name: "Drift History", href: "/tenant/drift/history", icon: FileText },
      { name: "Drift Policies", href: "/tenant/drift/policies", icon: Settings },
    ],
  },
  {
    name: "Compliance",
    href: "/tenant/compliance",
    icon: CheckCircle,
    badge: "SOC 2",
    children: [
      { name: "Compliance Dashboard", href: "/tenant/compliance", icon: LayoutDashboard },
      { name: "Audit Reports", href: "/tenant/compliance/audit", icon: FileText },
      { name: "Policy Management", href: "/tenant/compliance/policies", icon: Settings },
    ],
  },
  {
    name: "AI Assistant",
    href: "/tenant/ai-assistant",
    icon: Brain,
    badge: "New",
    children: [
      { name: "Assistant Dashboard", href: "/tenant/ai-assistant", icon: LayoutDashboard },
      { name: "Chat Interface", href: "/tenant/ai-assistant/chat", icon: Brain },
    ],
  },
  {
    name: "Recovery Copilot",
    href: "/tenant/copilot",
    icon: Brain,
    children: [
      { name: "Copilot Dashboard", href: "/tenant/copilot", icon: LayoutDashboard },
      { name: "Chat with Copilot", href: "/tenant/copilot/chat", icon: Brain },
    ],
  },
  {
    name: "Executive Dashboards",
    href: "/tenant/executive",
    icon: Users,
    children: [
      { name: "CISO Dashboard", href: "/tenant/executive/ciso", icon: Shield },
      { name: "CIO Dashboard", href: "/tenant/executive/cio", icon: LayoutDashboard },
      { name: "CloudOps Dashboard", href: "/tenant/executive/cloudops", icon: Activity },
      { name: "Risk Heatmap", href: "/tenant/executive/risk-heatmap", icon: AlertTriangle },
    ],
  },
]

interface TenantLayoutProps {
  children: React.ReactNode
}

export function TenantLayout({ children }: TenantLayoutProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(true)
  const [expandedItems, setExpandedItems] = React.useState<string[]>([])

  const isActiveRoute = (href: string) => {
    if (href === "/tenant/overview") {
      return pathname === "/tenant" || pathname === "/tenant/overview"
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
                            <AvatarFallback>DU</AvatarFallback>
                          </Avatar>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Demo User</DropdownMenuLabel>
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
                    <p>Demo User</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="w-full justify-start p-0 h-auto">
                      <div className="flex items-center w-full">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="/placeholder.svg?height=32&width=32" />
                          <AvatarFallback>DU</AvatarFallback>
                        </Avatar>
                        <div className="ml-3 text-left">
                          <p className="text-sm font-medium text-gray-700">Demo User</p>
                          <p className="text-xs text-gray-500">demo@ascintra.ai</p>
                        </div>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Demo User</DropdownMenuLabel>
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
              <span className="ml-2 text-xl font-bold text-gray-900">Ascintra.ai</span>
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
                              <AvatarFallback>DU</AvatarFallback>
                            </Avatar>
                            <div className="ml-3 text-left">
                              <p className="text-sm font-medium text-gray-700">Demo User</p>
                              <p className="text-xs text-gray-500">demo@ascintra.ai</p>
                            </div>
                          </div>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Demo User</DropdownMenuLabel>
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
