import type React from "react"
import type { LucideIcon } from "lucide-react"

export interface NavigationItem {
  label: string
  href: string
  icon?: LucideIcon
  children?: NavigationItem[]
  badge?: string | number
}

export interface NavigationGroup {
  title: string
  icon: React.ComponentType<{ className?: string }>
  items: NavigationItem[]
}

export interface UserNavigation {
  name: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
}

export interface BreadcrumbItem {
  name: string
  href?: string
  current?: boolean
}

export interface SidebarSection {
  title: string
  items: NavigationItem[]
}

export interface TabItem {
  name: string
  href: string
  current?: boolean
  count?: number
}

export interface StepItem {
  id: string
  name: string
  description?: string
  status: "complete" | "current" | "upcoming"
  href?: string
}
