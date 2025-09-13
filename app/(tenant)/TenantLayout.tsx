"use client"

import type React from "react"

import { MainLayout } from "@/components/main-layout"
import {
  LayoutDashboard,
  Search,
  Package,
  Shield,
  TestTube,
  Bot,
  Users,
  Globe,
  TrendingUp,
  Clock,
  Database,
  MessageSquare,
  BarChart3,
  AlertTriangle,
} from "lucide-react"
import type { NavigationItem } from "@/types/navigation"

const tenantNavigationItems: NavigationItem[] = [
  {
    label: "Overview",
    href: "/tenant/overview",
    icon: LayoutDashboard,
  },
  {
    label: "Discovery",
    href: "/tenant/discovery",
    icon: Search,
    children: [
      {
        label: "Connect Account",
        href: "/tenant/discovery/connect",
        icon: Database,
      },
      {
        label: "History",
        href: "/tenant/discovery/history",
        icon: Clock,
      },
    ],
  },
  {
    label: "Inventory",
    href: "/tenant/inventory",
    icon: Package,
    children: [
      {
        label: "Assets",
        href: "/tenant/inventory",
        icon: Package,
      },
      {
        label: "Coverage",
        href: "/tenant/inventory/coverage",
        icon: Shield,
      },
      {
        label: "Details",
        href: "/tenant/inventory/details",
        icon: BarChart3,
      },
    ],
  },
  {
    label: "Recovery Posture",
    href: "/tenant/posture",
    icon: Shield,
    children: [
      {
        label: "Scorecard",
        href: "/tenant/posture/scorecard",
        icon: BarChart3,
      },
      {
        label: "RTO/RPO",
        href: "/tenant/posture/rto-rpo",
        icon: Clock,
      },
      {
        label: "Trends",
        href: "/tenant/posture/trends",
        icon: TrendingUp,
      },
      {
        label: "Global Posture Map",
        href: "/tenant/posture/map",
        icon: Globe,
      },
    ],
  },
  {
    label: "Recovery Testing",
    href: "/tenant/recovery-testing",
    icon: TestTube,
    children: [
      {
        label: "Dashboard",
        href: "/tenant/recovery-testing/dashboard",
        icon: LayoutDashboard,
      },
      {
        label: "Simulator",
        href: "/tenant/recovery-testing/simulator",
        icon: TestTube,
      },
    ],
  },
  {
    label: "AI Assistant",
    href: "/tenant/ai-assistant",
    icon: Bot,
    children: [
      {
        label: "Copilot",
        href: "/tenant/copilot",
        icon: Bot,
      },
      {
        label: "Chat",
        href: "/tenant/ai-assistant/chat",
        icon: MessageSquare,
      },
    ],
  },
  {
    label: "Executive",
    href: "/tenant/executive",
    icon: Users,
    children: [
      {
        label: "CIO Dashboard",
        href: "/tenant/executive/cio",
        icon: BarChart3,
      },
      {
        label: "CloudOps Dashboard",
        href: "/tenant/executive/cloudops",
        icon: LayoutDashboard,
      },
      {
        label: "CISO Dashboard",
        href: "/tenant/executive/ciso",
        icon: Shield,
      },
      {
        label: "Risk Heatmap",
        href: "/tenant/executive/risk-heatmap",
        icon: AlertTriangle,
      },
    ],
  },
]

export function TenantLayout({ children }: { children: React.ReactNode }) {
  return (
    <MainLayout
      navigationItems={tenantNavigationItems}
      userRole="tenant"
      userName="Demo User"
      userEmail="demo@ascintra.ai"
    >
      {children}
    </MainLayout>
  )
}
