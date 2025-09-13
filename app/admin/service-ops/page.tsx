"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Search,
  MoreHorizontal,
  RefreshCw,
  Play,
  Pause,
  Trash2,
  ExternalLink,
  Activity,
  Server,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react"

interface HelmRelease {
  name: string
  namespace: string
  chart: string
  version: string
  appVersion: string
  status: "deployed" | "failed" | "pending" | "superseded"
  revision: number
  updated: string
  description: string
  resources: {
    pods: number
    services: number
    deployments: number
  }
}

const helmReleases: HelmRelease[] = [
  {
    name: "recovery-vault-api",
    namespace: "production",
    chart: "recovery-vault/api",
    version: "2.4.1",
    appVersion: "v2.4.1",
    status: "deployed",
    revision: 15,
    updated: "2024-01-08 14:30:22",
    description: "Main API service for RecoveryVault platform",
    resources: { pods: 3, services: 2, deployments: 1 },
  },
  {
    name: "recovery-vault-web",
    namespace: "production",
    chart: "recovery-vault/web",
    version: "1.8.3",
    appVersion: "v1.8.3",
    status: "deployed",
    revision: 12,
    updated: "2024-01-08 13:45:10",
    description: "Frontend web application",
    resources: { pods: 2, services: 1, deployments: 1 },
  },
  {
    name: "recovery-vault-scanner",
    namespace: "production",
    chart: "recovery-vault/scanner",
    version: "3.1.0",
    appVersion: "v3.1.0",
    status: "failed",
    revision: 8,
    updated: "2024-01-08 12:15:33",
    description: "Security scanning service",
    resources: { pods: 0, services: 1, deployments: 1 },
  },
  {
    name: "postgresql",
    namespace: "production",
    chart: "bitnami/postgresql",
    version: "12.8.2",
    appVersion: "15.4.0",
    status: "deployed",
    revision: 3,
    updated: "2024-01-07 09:20:15",
    description: "PostgreSQL database cluster",
    resources: { pods: 2, services: 2, deployments: 1 },
  },
]

const getStatusIcon = (status: string) => {
  switch (status) {
    case "deployed":
      return <CheckCircle className="h-4 w-4 text-success" />
    case "failed":
      return <AlertTriangle className="h-4 w-4 text-critical" />
    case "pending":
      return <Clock className="h-4 w-4 text-warning" />
    case "superseded":
      return <RefreshCw className="h-4 w-4 text-muted-foreground" />
    default:
      return <Activity className="h-4 w-4 text-muted-foreground" />
  }
}

const getStatusVariant = (status: string) => {
  switch (status) {
    case "deployed":
      return "success"
    case "failed":
      return "critical"
    case "pending":
      return "warning"
    case "superseded":
      return "secondary"
    default:
      return "secondary"
  }
}

export default function ServiceOpsPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredReleases = helmReleases.filter((release) => {
    const matchesSearch =
      release.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      release.chart.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const statusCounts = {
    deployed: helmReleases.filter((r) => r.status === "deployed").length,
    failed: helmReleases.filter((r) => r.status === "failed").length,
    pending: helmReleases.filter((r) => r.status === "pending").length,
    total: helmReleases.length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Service Operations</h1>
          <p className="text-muted-foreground">Monitor and manage Kubernetes deployments and infrastructure</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <ExternalLink className="h-4 w-4 mr-2" />
            Kubernetes Dashboard
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Releases</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.total}</div>
            <p className="text-xs text-muted-foreground">Across all namespaces</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deployed</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{statusCounts.deployed}</div>
            <p className="text-xs text-muted-foreground">Running successfully</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <AlertTriangle className="h-4 w-4 text-critical" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-critical">{statusCounts.failed}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{statusCounts.pending}</div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>
      </div>

      {/* Helm Releases Table */}
      <Card>
        <CardHeader>
          <CardTitle>Helm Releases</CardTitle>
          <CardDescription>Manage Kubernetes applications deployed via Helm</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search releases..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Release</TableHead>
                <TableHead>Namespace</TableHead>
                <TableHead>Chart</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Resources</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReleases.map((release) => (
                <TableRow key={`${release.namespace}-${release.name}`}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{release.name}</div>
                      <div className="text-sm text-muted-foreground">Rev. {release.revision}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{release.namespace}</Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{release.chart}</div>
                      <div className="text-sm text-muted-foreground">App: {release.appVersion}</div>
                    </div>
                  </TableCell>
                  <TableCell>{release.version}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(release.status)}
                      <Badge variant={getStatusVariant(release.status)}>{release.status}</Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm space-y-1">
                      <div>Pods: {release.resources.pods}</div>
                      <div>Services: {release.resources.services}</div>
                      <div>Deployments: {release.resources.deployments}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{release.updated}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Play className="mr-2 h-4 w-4" />
                          Upgrade
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Rollback
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Pause className="mr-2 h-4 w-4" />
                          Scale Down
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-critical">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Uninstall
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
