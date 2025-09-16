"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Footer } from "@/components/ui/footer"
import {
  Users,
  Building2,
  Settings,
  BarChart3,
  Shield,
  CreditCard,
  Puzzle,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
} from "lucide-react"
import Link from "next/link"

export default function AdminDashboard() {
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <div className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                <p className="text-muted-foreground">Platform administration and tenant management</p>
              </div>
              <div className="flex items-center space-x-2">
                <img src="/images/ascintra-logo.png" alt="Ascintra.ai" className="h-8 w-8" />
                <span className="font-semibold">Ascintra.ai</span>
              </div>
            </div>

            {/* System Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {systemMetrics.map((metric) => (
                <Card key={metric.label}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
                    {metric.trend === "up" && <TrendingUp className="h-4 w-4 text-green-600" />}
                    {metric.trend === "down" && <AlertTriangle className="h-4 w-4 text-red-600" />}
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metric.value}</div>
                    <p className="text-xs text-muted-foreground">{metric.change} from last month</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Actions */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                {quickActions.map((action) => (
                  <Card key={action.title} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <action.icon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{action.title}</CardTitle>
                            <CardDescription>{action.description}</CardDescription>
                          </div>
                        </div>
                        <Badge variant="secondary">{action.badge}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button asChild className="w-full bg-transparent" variant="outline">
                        <Link href={action.href}>
                          Manage
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Additional Admin Sections */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Analytics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">Platform usage and performance analytics</p>
                  <Button variant="outline" className="w-full bg-transparent">
                    View Reports
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5" />
                    <span>Billing</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">Manage billing and subscription plans</p>
                  <Button asChild variant="outline" className="w-full bg-transparent">
                    <Link href="/admin/billing">Manage Billing</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Security</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">Security settings and audit logs</p>
                  <Button asChild variant="outline" className="w-full bg-transparent">
                    <Link href="/admin/audit">View Audit</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Platform Health Status */}
            <Card className="border-2 border-green-200 dark:border-green-800">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                    <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <CardTitle>Ascintra.ai Platform Status</CardTitle>
                    <CardDescription>All systems operational - CRPM services running smoothly</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <Badge variant="default" className="bg-green-500">
                    Operational
                  </Badge>
                  <span className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer variant="admin" />
    </div>
  )
}
