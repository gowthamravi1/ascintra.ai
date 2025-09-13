"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  {
    name: "redis",
    namespace: "production",
    chart: "bitnami/redis",
    version: "18.1.5",
    appVersion: "7.2.1",
    status: "deployed",
    revision: 5,
    updated: "2024-01-07 08:45:22",
    description: "Redis cache and session store",
    resources: { pods: 1, services: 1, deployments: 1 },
  },
  {
    name: "nginx-ingress",
    namespace: "ingress-system",
    chart: "ingress-nginx/ingress-nginx",
    version: "4.8.3",
    appVersion: "1.9.4",
    status: "deployed",
    revision: 7,
    updated: "2024-01-06 16:30:45",
    description: "NGINX Ingress Controller",
    resources: { pods: 2, services: 2, deployments: 1 },
  },
  {
    name: "cert-manager",
    namespace: "cert-manager",
    chart: "jetstack/cert-manager",
    version: "1.13.2",
    appVersion: "v1.13.2",
    status: "deployed",
    revision: 4,
    updated: "2024-01-05 11:20:18",
    description: "Certificate management for Kubernetes",
    resources: { pods: 3, services: 1, deployments: 3 },
  },
  {
    name: "monitoring-stack",
    namespace: "monitoring",
    chart: "prometheus-community/kube-prometheus-stack",
    version: "54.2.2",
    appVersion: "v0.68.0",
    status: "pending",
    revision: 2,
    updated: "2024-01-08 15:10:05",
    description: "Prometheus, Grafana, and AlertManager stack",
    resources: { pods: 8, services: 6, deployments: 4 },
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
  const [selectedNamespace, setSelectedNamespace] = useState("all")

  const filteredReleases = helmReleases.filter((release) => {
    const matchesSearch =
      release.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      release.chart.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesNamespace = selectedNamespace === "all" || release.namespace === selectedNamespace
    return matchesSearch && matchesNamespace
  })

  const namespaces = Array.from(new Set(helmReleases.map((r) => r.namespace)))
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

      {/* Main Content Tabs */}
      <Tabs defaultValue="releases" className="space-y-6">
        <TabsList>
          <TabsTrigger value="releases">Helm Releases</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="releases" className="space-y-6">
          {/* Helm Releases Table */}
          <Card>
            <CardHeader>
              <CardTitle>Helm Releases</CardTitle>
              <CardDescription>Manage Kubernetes applications deployed via Helm</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search and Filters */}
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      Namespace: {selectedNamespace === "all" ? "All" : selectedNamespace}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setSelectedNamespace("all")}>All Namespaces</DropdownMenuItem>
                    {namespaces.map((ns) => (
                      <DropdownMenuItem key={ns} onClick={() => setSelectedNamespace(ns)}>
                        {ns}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
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
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          {/* Monitoring Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Grafana Dashboard */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Infrastructure Monitoring</CardTitle>
                    <CardDescription>Real-time metrics and performance data</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open in Grafana
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative w-full h-[600px] bg-muted/20 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
                  {/* Grafana Iframe Placeholder */}
                  <div className="text-center space-y-4">
                    <Activity className="h-12 w-12 text-muted-foreground mx-auto" />
                    <div>
                      <h3 className="text-lg font-medium text-muted-foreground">Grafana Dashboard</h3>
                      <p className="text-sm text-muted-foreground">Embedded monitoring dashboard would appear here</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        URL: https://grafana.recoveryvault.internal/d/kubernetes-overview
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open External Dashboard
                    </Button>
                  </div>

                  {/* Uncomment to use actual Grafana iframe */}
                  {/*
                  <iframe
                    src="https://grafana.recoveryvault.internal/d-solo/kubernetes-overview/kubernetes-overview?orgId=1&refresh=30s&theme=light"
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    className="rounded-lg"
                    title="Grafana Dashboard"
                  />
                  */}
                </div>
              </CardContent>
            </Card>

            {/* Quick Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Cluster Resources</CardTitle>
                <CardDescription>Current resource utilization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>CPU Usage</span>
                    <span className="font-medium">68%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-warning h-2 rounded-full" style={{ width: "68%" }} />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Memory Usage</span>
                    <span className="font-medium">45%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-success h-2 rounded-full" style={{ width: "45%" }} />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Storage Usage</span>
                    <span className="font-medium">82%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-critical h-2 rounded-full" style={{ width: "82%" }} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Alerts */}
            <Card>
              <CardHeader>
                <CardTitle>Active Alerts</CardTitle>
                <CardDescription>Current system alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-critical mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">High Storage Usage</p>
                      <p className="text-xs text-muted-foreground">Storage usage above 80% threshold</p>
                      <p className="text-xs text-muted-foreground">2 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-warning mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Scanner Service Down</p>
                      <p className="text-xs text-muted-foreground">recovery-vault-scanner pods not ready</p>
                      <p className="text-xs text-muted-foreground">15 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <Activity className="h-4 w-4 text-accent mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">High CPU Load</p>
                      <p className="text-xs text-muted-foreground">CPU usage above 65% for 10 minutes</p>
                      <p className="text-xs text-muted-foreground">1 hour ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
