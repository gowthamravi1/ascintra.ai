"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Filter, Download, MoreHorizontal, Eye, Shield, AlertTriangle } from "lucide-react"

interface Resource {
  id: string
  name: string
  type: string
  service: string
  region: string
  status: "protected" | "unprotected" | "partial"
  lastBackup?: string
  rpo: string
  rto: string
  criticality: "high" | "medium" | "low"
}

interface ServiceStats {
  service: string
  total: number
  protected: number
  unprotected: number
  coverage: number
}

const fallbackResources: Resource[] = [
  {
    id: "i-1234567890abcdef0",
    name: "web-server-prod-01",
    type: "EC2 Instance",
    service: "EC2",
    region: "us-east-1",
    status: "protected",
    lastBackup: "2 hours ago",
    rpo: "4h",
    rto: "1h",
    criticality: "high",
  },
  {
    id: "vol-0987654321fedcba0",
    name: "database-storage",
    type: "EBS Volume",
    service: "EBS",
    region: "us-east-1",
    status: "protected",
    lastBackup: "1 hour ago",
    rpo: "1h",
    rto: "30m",
    criticality: "high",
  },
  {
    id: "i-abcdef1234567890",
    name: "test-server-dev-01",
    type: "EC2 Instance",
    service: "EC2",
    region: "us-west-2",
    status: "unprotected",
    rpo: "24h",
    rto: "4h",
    criticality: "low",
  },
  {
    id: "db-cluster-prod",
    name: "production-database",
    type: "RDS Cluster",
    service: "RDS",
    region: "us-east-1",
    status: "protected",
    lastBackup: "30 minutes ago",
    rpo: "15m",
    rto: "15m",
    criticality: "high",
  },
  {
    id: "lambda-api-handler",
    name: "api-gateway-handler",
    type: "Lambda Function",
    service: "Lambda",
    region: "us-east-1",
    status: "partial",
    lastBackup: "6 hours ago",
    rpo: "12h",
    rto: "2h",
    criticality: "medium",
  },
]

const serviceStats: ServiceStats[] = [
  { service: "EC2", total: 45, protected: 38, unprotected: 7, coverage: 84 },
  { service: "RDS", total: 12, protected: 11, unprotected: 1, coverage: 92 },
  { service: "EBS", total: 89, protected: 76, unprotected: 13, coverage: 85 },
  { service: "Lambda", total: 23, protected: 15, unprotected: 8, coverage: 65 },
  { service: "S3", total: 156, protected: 142, unprotected: 14, coverage: 91 },
]

const regionStats = [
  { region: "us-east-1", total: 187, protected: 159, coverage: 85 },
  { region: "us-west-2", total: 98, protected: 82, coverage: 84 },
  { region: "eu-west-1", total: 67, protected: 61, coverage: 91 },
  { region: "ap-southeast-1", total: 23, protected: 20, coverage: 87 },
]

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [serviceFilter, setServiceFilter] = useState("all")
  const [regionFilter, setRegionFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [resourcesData, setResourcesData] = useState<Resource[]>(fallbackResources)
  const [protectedCount, setProtectedCount] = useState(0)
  const [unprotectedCount, setUnprotectedCount] = useState(0)

  const toRelative = (val?: string | number | null): string | undefined => {
    if (val === undefined || val === null) return undefined
    const d = typeof val === 'number' ? new Date(val * 1000) : new Date(val)
    if (isNaN(d.getTime())) return undefined
    const ms = Date.now() - d.getTime()
    const mins = Math.floor(ms / 60000)
    if (mins < 60) return `${mins} minutes ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs} hours ago`
    const days = Math.floor(hrs / 24)
    return `${days} days ago`
  }

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/tenant/inventory", { cache: "no-store" })
        if (!res.ok) return
        const data = await res.json()
        const items = Array.isArray(data?.items) ? data.items : []
        const mapped: Resource[] = items.map((it: any) => {
          const statusRaw = String(it.status ?? "unprotected").toLowerCase()
          const status: Resource["status"] = statusRaw === "protected" ? "protected" : statusRaw === "partial" ? "partial" : "unprotected"
          return {
            id: String(it.id ?? ""),
            name: String(it.name ?? it.id ?? "unknown"),
            type: String(it.type ?? "unknown"),
            service: String(it.service ?? it.type ?? "unknown"),
            region: String(it.region ?? "unknown"),
            status,
            lastBackup: toRelative(it.last_backup),
            rpo: "-",
            rto: "-",
            criticality: status === "unprotected" ? "high" : "low",
          }
        })
        if (mapped.length) {
          setResourcesData(mapped)
          const prot = mapped.filter((r) => r.status === "protected").length
          const unprot = mapped.filter((r) => r.status === "unprotected").length
          setProtectedCount(prot)
          setUnprotectedCount(unprot)
        }
      } catch (e) {
        // ignore and keep fallback
      }
    }
    load()
  }, [])

  const filteredResources = resourcesData.filter((resource) => {
    const matchesSearch =
      resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesService = serviceFilter === "all" || resource.service === serviceFilter
    const matchesRegion = regionFilter === "all" || resource.region === regionFilter
    const matchesStatus = statusFilter === "all" || resource.status === statusFilter

    return matchesSearch && matchesService && matchesRegion && matchesStatus
  })

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "protected":
        return "success"
      case "unprotected":
        return "critical"
      case "partial":
        return "warning"
      default:
        return "secondary"
    }
  }

  const getCriticalityBadgeVariant = (criticality: string) => {
    switch (criticality) {
      case "high":
        return "critical"
      case "medium":
        return "warning"
      case "low":
        return "secondary"
      default:
        return "secondary"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "protected":
        return <Shield className="h-4 w-4 text-green-600" />
      case "unprotected":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case "partial":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Resource Inventory</h1>
          <p className="text-muted-foreground">Monitor and manage your cloud resources and backup coverage</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button className="gap-2">
            <Filter className="h-4 w-4" />
            Advanced Filters
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resourcesData.length}</div>
            <p className="text-xs text-muted-foreground">Across all services</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Protected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{protectedCount}</div>
            <p className="text-xs text-muted-foreground">
              {resourcesData.length ? `${Math.round((protectedCount / resourcesData.length) * 1000) / 10}% coverage` : "0% coverage"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Unprotected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-critical">{unprotectedCount}</div>
            <p className="text-xs text-muted-foreground">Needs attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Critical Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{resourcesData.filter((r) => r.criticality === "high").length}</div>
            <p className="text-xs text-muted-foreground">High priority</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle>Resource Overview</CardTitle>
          <CardDescription>Detailed view of all your cloud resources and their backup status</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="resources" className="space-y-6">
            <TabsList>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="regions">Regions</TabsTrigger>
            </TabsList>

            <TabsContent value="resources" className="space-y-4">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search resources..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={serviceFilter} onValueChange={setServiceFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Services" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Services</SelectItem>
                    <SelectItem value="EC2">EC2</SelectItem>
                    <SelectItem value="RDS">RDS</SelectItem>
                    <SelectItem value="EBS">EBS</SelectItem>
                    <SelectItem value="Lambda">Lambda</SelectItem>
                    <SelectItem value="S3">S3</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={regionFilter} onValueChange={setRegionFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Regions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    <SelectItem value="us-east-1">us-east-1</SelectItem>
                    <SelectItem value="us-west-2">us-west-2</SelectItem>
                    <SelectItem value="eu-west-1">eu-west-1</SelectItem>
                    <SelectItem value="ap-southeast-1">ap-southeast-1</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="protected">Protected</SelectItem>
                    <SelectItem value="unprotected">Unprotected</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Resources Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Resource</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Backup</TableHead>
                    <TableHead>RPO/RTO</TableHead>
                    <TableHead>Criticality</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResources.map((resource) => (
                    <TableRow key={resource.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{resource.name}</div>
                          <div className="text-sm text-muted-foreground">{resource.type}</div>
                          <div className="text-xs text-muted-foreground">{resource.id}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{resource.service}</Badge>
                      </TableCell>
                      <TableCell>{resource.region}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(resource.status)}
                          <Badge variant={getStatusBadgeVariant(resource.status)}>{resource.status}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {resource.lastBackup ? (
                          <span className="text-sm">{resource.lastBackup}</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">Never</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>RPO: {resource.rpo}</div>
                          <div>RTO: {resource.rto}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getCriticalityBadgeVariant(resource.criticality)}>{resource.criticality}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Shield className="mr-2 h-4 w-4" />
                              Configure Backup
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="services" className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Total Resources</TableHead>
                    <TableHead>Protected</TableHead>
                    <TableHead>Unprotected</TableHead>
                    <TableHead>Coverage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {serviceStats.map((stat) => (
                    <TableRow key={stat.service}>
                      <TableCell className="font-medium">{stat.service}</TableCell>
                      <TableCell>{stat.total}</TableCell>
                      <TableCell>
                        <span className="text-green-600 font-medium">{stat.protected}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-red-600 font-medium">{stat.unprotected}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div className="bg-green-600 h-2 rounded-full" style={{ width: `${stat.coverage}%` }} />
                          </div>
                          <span className="text-sm font-medium">{stat.coverage}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="regions" className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Region</TableHead>
                    <TableHead>Total Resources</TableHead>
                    <TableHead>Protected</TableHead>
                    <TableHead>Coverage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {regionStats.map((stat) => (
                    <TableRow key={stat.region}>
                      <TableCell className="font-medium">{stat.region}</TableCell>
                      <TableCell>{stat.total}</TableCell>
                      <TableCell>
                        <span className="text-green-600 font-medium">{stat.protected}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div className="bg-green-600 h-2 rounded-full" style={{ width: `${stat.coverage}%` }} />
                          </div>
                          <span className="text-sm font-medium">{stat.coverage}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
