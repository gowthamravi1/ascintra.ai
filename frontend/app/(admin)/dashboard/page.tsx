"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, TrendingUp, Users, Shield, Activity } from "lucide-react"
import { LineChart, Line, ResponsiveContainer, AreaChart, Area } from "recharts"

const healthData = [
  { time: "00:00", value: 95 },
  { time: "04:00", value: 97 },
  { time: "08:00", value: 94 },
  { time: "12:00", value: 98 },
  { time: "16:00", value: 96 },
  { time: "20:00", value: 99 },
]

const tenantData = [
  { time: "Jan", value: 120 },
  { time: "Feb", value: 135 },
  { time: "Mar", value: 148 },
  { time: "Apr", value: 162 },
  { time: "May", value: 178 },
  { time: "Jun", value: 195 },
]

const scanData = [
  { time: "Mon", value: 45 },
  { time: "Tue", value: 52 },
  { time: "Wed", value: 48 },
  { time: "Thu", value: 61 },
  { time: "Fri", value: 55 },
  { time: "Sat", value: 38 },
  { time: "Sun", value: 42 },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Platform overview and key metrics</p>
        </div>
        <Button variant="outline" className="gap-2 bg-transparent">
          <Calendar className="h-4 w-4" />
          Last 30 days
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">99.2%</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +0.3% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tenants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">195</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +12 new this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Scans</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +18% from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
            <Badge variant="critical">3</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-critical">3</div>
            <p className="text-xs text-muted-foreground">Requires immediate attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Platform Health</CardTitle>
            <CardDescription>System uptime over the last 24 hours</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={healthData}>
                  <Line type="monotone" dataKey="value" stroke="hsl(var(--success))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Tenants</CardTitle>
            <CardDescription>Growth over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={tenantData}>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Scans</CardTitle>
            <CardDescription>Daily scan volume this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={scanData}>
                  <Line type="monotone" dataKey="value" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest platform events and alerts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                type: "success",
                message: "Tenant 'Acme Corp' provisioned successfully",
                time: "2 minutes ago",
              },
              {
                type: "warning",
                message: "High memory usage detected on node-3",
                time: "15 minutes ago",
              },
              {
                type: "info",
                message: "Backup completed for 12 tenants",
                time: "1 hour ago",
              },
              {
                type: "critical",
                message: "Failed login attempts from suspicious IP",
                time: "2 hours ago",
              },
            ].map((activity, index) => (
              <div key={index} className="flex items-center gap-4 p-3 rounded-lg border">
                <div
                  className={`h-2 w-2 rounded-full ${
                    activity.type === "success"
                      ? "bg-success"
                      : activity.type === "warning"
                        ? "bg-warning"
                        : activity.type === "critical"
                          ? "bg-critical"
                          : "bg-accent"
                  }`}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.message}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
                <Badge
                  variant={
                    activity.type === "success"
                      ? "success"
                      : activity.type === "warning"
                        ? "warning"
                        : activity.type === "critical"
                          ? "critical"
                          : "info"
                  }
                >
                  {activity.type}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
