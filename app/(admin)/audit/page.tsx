"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Download } from "lucide-react"

const auditLogs = [
  {
    id: 1,
    user: "John Smith",
    userEmail: "john.smith@acmecorp.com",
    tenant: "Acme Corporation",
    action: "User Login",
    description: "Successful login from IP 192.168.1.100",
    timestamp: "2024-01-08 15:30:22",
    severity: "info",
    resource: "Authentication",
  },
  {
    id: 2,
    user: "Sarah Johnson",
    userEmail: "sarah.j@techstart.com",
    tenant: "TechStart Inc",
    action: "Scan Initiated",
    description: "Started security scan for 156 assets",
    timestamp: "2024-01-08 15:25:15",
    severity: "info",
    resource: "Security Scan",
  },
  {
    id: 3,
    user: "Admin System",
    userEmail: "system@recoveryvault.com",
    tenant: "Global Dynamics",
    action: "Tenant Suspended",
    description: "Tenant suspended due to billing issues",
    timestamp: "2024-01-08 14:45:33",
    severity: "warning",
    resource: "Tenant Management",
  },
  {
    id: 4,
    user: "Mike Chen",
    userEmail: "m.chen@globaldyn.com",
    tenant: "Global Dynamics",
    action: "Failed Login",
    description: "Multiple failed login attempts detected",
    timestamp: "2024-01-08 14:20:18",
    severity: "critical",
    resource: "Authentication",
  },
  {
    id: 5,
    user: "System Backup",
    userEmail: "backup@recoveryvault.com",
    tenant: "System",
    action: "Backup Completed",
    description: "Daily backup completed successfully",
    timestamp: "2024-01-08 02:00:00",
    severity: "success",
    resource: "System Backup",
  },
]

export default function AuditLogPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTenant, setSelectedTenant] = useState("all")
  const [selectedSeverity, setSelectedSeverity] = useState("all")

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTenant = selectedTenant === "all" || log.tenant === selectedTenant
    const matchesSeverity = selectedSeverity === "all" || log.severity === selectedSeverity
    return matchesSearch && matchesTenant && matchesSeverity
  })

  const tenants = Array.from(new Set(auditLogs.map((log) => log.tenant)))
  const severities = Array.from(new Set(auditLogs.map((log) => log.severity)))

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case "critical":
        return "critical"
      case "warning":
        return "warning"
      case "success":
        return "success"
      case "info":
        return "info"
      default:
        return "secondary"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Audit Log</h1>
          <p className="text-muted-foreground">Track all system activities and user actions</p>
        </div>
        <Button variant="outline" className="gap-2 bg-transparent">
          <Download className="h-4 w-4" />
          Export Logs
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,847</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Critical Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-critical">23</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Failed Logins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">156</div>
            <p className="text-xs text-muted-foreground">Security incidents</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">1,247</div>
            <p className="text-xs text-muted-foreground">Unique users today</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
          <CardDescription>Chronological view of all system events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search audit logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedTenant} onValueChange={setSelectedTenant}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by tenant" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tenants</SelectItem>
                {tenants.map((tenant) => (
                  <SelectItem key={tenant} value={tenant}>
                    {tenant}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                {severities.map((severity) => (
                  <SelectItem key={severity} value={severity}>
                    {severity}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {filteredLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-4 p-4 border rounded-lg">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={`/placeholder.svg?height=40&width=40`} />
                  <AvatarFallback>
                    {log.user
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{log.user}</span>
                      <Badge variant="outline">{log.tenant}</Badge>
                      <Badge variant={getSeverityBadgeVariant(log.severity)}>{log.severity}</Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">{log.timestamp}</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">{log.action}</p>
                    <p className="text-sm text-muted-foreground">{log.description}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Resource: {log.resource}</span>
                    <span>•</span>
                    <span>User: {log.userEmail}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
