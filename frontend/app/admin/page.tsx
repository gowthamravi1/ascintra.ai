"use client"
import { Users, Building2, Settings, Puzzle } from "lucide-react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AdminPage() {
  const router = useRouter()

  useEffect(() => {
    router.push("/admin/dashboard")
  }, [router])

  const quickActions = [
    {
      title: "Tenant Management",
      description: "Manage customer tenants and provisioning",
      icon: Building2,
      href: "/admin/tenants",
      badge: "12 Active",
    },
    {
      title: "User Management",
      description: "Manage platform users and permissions",
      icon: Users,
      href: "/admin/users",
      badge: "48 Users",
    },
    {
      title: "Service Operations",
      description: "Monitor platform health and performance",
      icon: Settings,
      href: "/admin/service-ops",
      badge: "All Systems Operational",
    },
    {
      title: "Integrations",
      description: "Configure AWS and third-party integrations",
      icon: Puzzle,
      href: "/admin/integrations",
      badge: "8 Connected",
    },
  ]

  const systemMetrics = [
    { label: "Active Tenants", value: "12", change: "+2", trend: "up" },
    { label: "Total Users", value: "48", change: "+5", trend: "up" },
    { label: "API Requests/min", value: "1.2K", change: "-3%", trend: "down" },
    { label: "System Uptime", value: "99.9%", change: "0%", trend: "stable" },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )
}
