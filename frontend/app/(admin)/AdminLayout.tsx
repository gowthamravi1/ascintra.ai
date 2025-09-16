"use client"

import type React from "react"

import { MainLayout } from "@/components/main-layout"
import {
  LayoutDashboard,
  Users,
  Building2,
  Settings,
  CreditCard,
  FileText,
  HelpCircle,
  Activity,
  Shield,
  UserCheck,
  Zap,
  Mail,
  ToggleLeft,
  DollarSign,
  Receipt,
  BarChart3,
} from "lucide-react"
import type { NavigationItem } from "@/types/navigation"

const adminNavigationItems: NavigationItem[] = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Tenants",
    href: "/admin/tenants",
    icon: Building2,
    children: [
      {
        label: "All Tenants",
        href: "/admin/tenants",
        icon: Building2,
      },
      {
        label: "Provision New",
        href: "/admin/tenants/provision",
        icon: Zap,
      },
    ],
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    label: "Service Operations",
    href: "/admin/service-ops",
    icon: Activity,
  },
  {
    label: "Integrations",
    href: "/admin/integrations",
    icon: Zap,
  },
  {
    label: "Audit & Compliance",
    href: "/admin/audit",
    icon: Shield,
  },
  {
    label: "Roles & Permissions",
    href: "/admin/roles",
    icon: UserCheck,
  },
  {
    label: "SCIM",
    href: "/admin/scim",
    icon: Users,
  },
  {
    label: "Billing",
    href: "/admin/billing",
    icon: CreditCard,
    children: [
      {
        label: "Plans",
        href: "/admin/billing/plans",
        icon: DollarSign,
      },
      {
        label: "Invoices",
        href: "/admin/billing/invoices",
        icon: Receipt,
      },
      {
        label: "Usage",
        href: "/admin/billing/usage",
        icon: BarChart3,
      },
    ],
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: Settings,
    children: [
      {
        label: "Notifications",
        href: "/admin/settings/notifications",
        icon: Mail,
      },
      {
        label: "SMTP",
        href: "/admin/settings/smtp",
        icon: Mail,
      },
      {
        label: "Features",
        href: "/admin/settings/features",
        icon: ToggleLeft,
      },
    ],
  },
  {
    label: "Documentation",
    href: "/admin/docs",
    icon: FileText,
  },
  {
    label: "Support",
    href: "/admin/support",
    icon: HelpCircle,
  },
  {
    label: "System Status",
    href: "/admin/status",
    icon: Activity,
  },
]

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <MainLayout
      navigationItems={adminNavigationItems}
      userRole="admin"
      userName="Admin User"
      userEmail="admin@ascintra.ai"
    >
      {children}
    </MainLayout>
  )
}
