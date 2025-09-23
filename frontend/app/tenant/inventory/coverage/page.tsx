"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Search,
  Download,
  Shield,
  ShieldCheck,
  ShieldX,
  AlertTriangle,
  Database,
  Server,
  HardDrive,
  Globe,
  Zap,
  CheckCircle,
  Clock,
  MoreHorizontal,
  Eye,
  Settings,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react"

import { useEffect } from "react"
import Link from "next/link"

type CoverageService = { service: string; total: number; protected: number; partial: number; unprotected: number; coverage: number; trend?: string }
type CoverageItem = { 
  id: string; 
  name: string; 
  type: string; 
  service: string; 
  region: string; 
  status: string; 
  last_backup?: string | null;
  nextBackup?: string;
  rto?: string;
  rpo?: string;
  policy?: string;
  cost?: string;
}

const distColors = {
  Protected: "#10b981",
  Partial: "#f59e0b",
  Unprotected: "#ef4444",
} as const

const backupTrends = [
  { month: "Jul", protected: 78.2, partial: 12.1, unprotected: 9.7 },
  { month: "Aug", protected: 81.5, partial: 10.8, unprotected: 7.7 },
  { month: "Sep", protected: 83.1, partial: 9.9, unprotected: 7.0 },
  { month: "Oct", protected: 84.7, partial: 9.2, unprotected: 6.1 },
  { month: "Nov", protected: 85.2, partial: 8.3, unprotected: 6.5 },
  { month: "Dec", protected: 85.2, partial: 8.3, unprotected: 6.5 },
]

export default function BackupCoveragePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [serviceFilter, setServiceFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("overview")
  const [services, setServices] = useState<CoverageService[]>([])
  const [items, setItems] = useState<CoverageItem[]>([])
  const [summary, setSummary] = useState({ total: 0, protected: 0, partial: 0, unprotected: 0, coverage: 0 })

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/tenant/inventory/coverage", { cache: "no-store" })
        if (!res.ok) return
        const data = await res.json()
        setServices(Array.isArray(data?.by_service) ? data.by_service : [])
        setItems(Array.isArray(data?.items) ? data.items : [])
        setSummary(data?.summary || { total: 0, protected: 0, partial: 0, unprotected: 0, coverage: 0 })
      } catch {}
    }
    load()
  }, [])

  const filteredResources = items.filter((resource) => {
    const matchesSearch =
      resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || resource.status === statusFilter
    const matchesService = serviceFilter === "all" || resource.service === serviceFilter
    return matchesSearch && matchesStatus && matchesService
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "protected":
        return <ShieldCheck className="h-4 w-4 text-green-500" />
      case "partial":
        return <Shield className="h-4 w-4 text-yellow-500" />
      case "unprotected":
        return <ShieldX className="h-4 w-4 text-red-500" />
      default:
        return <Shield className="h-4 w-4 text-gray-400" />
    }
  }

  const coverageDistribution = (() => {
    const total = summary.total || 1
    const prot = summary.protected
    const partial = summary.partial
    const unprot = summary.unprotected
    return [
      { name: "Protected", value: Math.round((prot / total) * 1000) / 10, color: distColors.Protected, count: prot },
      { name: "Partial", value: Math.round((partial / total) * 1000) / 10, color: distColors.Partial, count: partial },
      { name: "Unprotected", value: Math.round((unprot / total) * 1000) / 10, color: distColors.Unprotected, count: unprot },
    ]
  })()

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "protected":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Protected</Badge>
      case "partial":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Partial</Badge>
      case "unprotected":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Unprotected</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      case "stable":
        return <Minus className="h-4 w-4 text-gray-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  const getServiceIcon = (service: string) => {
    switch (service) {
      case "EC2":
        return <Server className="h-4 w-4 text-blue-500" />
      case "RDS":
        return <Database className="h-4 w-4 text-green-500" />
      case "EKS":
        return <Server className="h-4 w-4 text-purple-500" />
      case "DynamoDB":
        return <Database className="h-4 w-4 text-orange-500" />
      case "EFS":
        return <HardDrive className="h-4 w-4 text-yellow-500" />
      case "S3":
        return <HardDrive className="h-4 w-4 text-red-500" />
      case "Lambda":
        return <Zap className="h-4 w-4 text-indigo-500" />
      case "ELB":
        return <Globe className="h-4 w-4 text-pink-500" />
      default:
        return <Server className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Backup Coverage Analysis</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor and analyze backup protection across all AWS resources
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" className="gap-2 bg-transparent">
            <RefreshCw className="h-4 w-4" />
            Refresh Analysis
          </Button>
          <Button variant="outline" className="gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
          <Button className="gap-2">
            <Settings className="h-4 w-4" />
            Configure Policies
          </Button>
        </div>
      </div>

      {/* Coverage Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Coverage</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.coverage}%</div>
            <Progress value={summary.coverage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">{summary.protected.toLocaleString()} of {summary.total.toLocaleString()} resources protected</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Protected Resources</CardTitle>
            <ShieldCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summary.protected.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Fully protected with backup policies</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Partial Coverage</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{summary.partial.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Resources with incomplete protection</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unprotected</CardTitle>
            <ShieldX className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{summary.unprotected.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Resources without backup protection</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Coverage Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Coverage Distribution</CardTitle>
                <CardDescription>Overall backup protection status breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={coverageDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {coverageDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [`${value}%`, name]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 mt-4">
                  {coverageDistribution.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm">
                        {item.name}: {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Service Coverage Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Coverage by Service</CardTitle>
                <CardDescription>Backup protection rates across AWS services</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={services}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="service" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip formatter={(value) => [`${value}%`, "Coverage"]} />
                      <Bar dataKey="coverage" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Critical Unprotected Resources */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Critical Unprotected Resources
              </CardTitle>
              <CardDescription>High-priority resources that require immediate backup protection</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items
                  .filter((r) => r.status === "unprotected")
                  .map((resource) => (
                    <div
                      key={resource.id}
                      className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-950 dark:border-red-800"
                    >
                      <div className="flex items-center gap-3">
                        {getServiceIcon(resource.service)}
                        <div>
                          <div className="font-medium">
                            <Link href={`/tenant/inventory/details?id=${encodeURIComponent(resource.id)}`} className="underline-offset-2 hover:underline">
                              {resource.name}
                            </Link>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {resource.type} • {resource.region}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Critical</Badge>
                        <Button size="sm" className="gap-2">
                          <Shield className="h-4 w-4" />
                          Configure Backup
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Service Coverage Breakdown</CardTitle>
              <CardDescription>Detailed backup coverage analysis by AWS service</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {services.map((service) => (
                  <div key={service.service} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getServiceIcon(service.service)}
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {service.service}
                          {getTrendIcon(service.trend)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{service.total} resources total</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between gap-4">
                            <span>Protected:</span>
                            <span className="font-medium text-green-600">{service.protected}</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span>Partial:</span>
                            <span className="font-medium text-yellow-600">{service.partial}</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span>Unprotected:</span>
                            <span className="font-medium text-red-600">{service.unprotected}</span>
                          </div>
                        </div>
                      </div>
                      <div className="w-32">
                        <Progress value={service.coverage ?? 0} className="h-2" />
                        <div className="text-xs text-center mt-1">{service.coverage ?? 0}%</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resource Details</CardTitle>
              <CardDescription>Individual resource backup status and configuration</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search resources..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="protected">Protected</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="unprotected">Unprotected</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={serviceFilter} onValueChange={setServiceFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Services</SelectItem>
                    <SelectItem value="EC2">EC2</SelectItem>
                    <SelectItem value="RDS">RDS</SelectItem>
                    <SelectItem value="EKS">EKS</SelectItem>
                    <SelectItem value="DynamoDB">DynamoDB</SelectItem>
                    <SelectItem value="EFS">EFS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Resources Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Resource</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Region</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Backup</TableHead>
                      <TableHead>Next Backup</TableHead>
                      <TableHead>RTO/RPO</TableHead>
                      <TableHead>Policy</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredResources.map((resource) => (
                      <TableRow key={resource.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(resource.status)}
                            <div>
                              <div className="font-medium">
                                <Link href={`/tenant/inventory/details?id=${encodeURIComponent(resource.id)}`} className="underline-offset-2 hover:underline">
                                  {resource.name}
                                </Link>
                              </div>
                              <div className="text-xs text-gray-500">{resource.type}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getServiceIcon(resource.service)}
                            <Badge variant="outline">{resource.service}</Badge>
                          </div>
                        </TableCell>
                        <TableCell>{resource.region}</TableCell>
                        <TableCell>{getStatusBadge(resource.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span className="text-sm">{resource.last_backup || ""}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {resource.nextBackup === "N/A" ? (
                              <span className="text-gray-400">N/A</span>
                            ) : resource.nextBackup === "Continuous" ? (
                              <span className="text-green-500">Continuous</span>
                            ) : (
                              resource.nextBackup
                            )}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {resource.rto !== "N/A" ? (
                              <>
                                <div>RTO: {resource.rto}</div>
                                <div>RPO: {resource.rpo}</div>
                              </>
                            ) : (
                              <span className="text-gray-400">N/A</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {resource.policy !== "None" ? (
                            <Badge variant="outline">{resource.policy}</Badge>
                          ) : (
                            <span className="text-gray-400">None</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium">{resource.cost}</span>
                        </TableCell>
                        <TableCell>
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
                                <Settings className="mr-2 h-4 w-4" />
                                Configure Backup
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Shield className="mr-2 h-4 w-4" />
                                Test Recovery
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Download className="mr-2 h-4 w-4" />
                                Export Details
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Coverage Trends
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-mono">MOCK</span>
              </CardTitle>
              <CardDescription>Backup coverage evolution over the past 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={backupTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value) => [`${value}%`, "Coverage"]} />
                    <Bar dataKey="protected" stackId="a" fill="#10b981" name="Protected" />
                    <Bar dataKey="partial" stackId="a" fill="#f59e0b" name="Partial" />
                    <Bar dataKey="unprotected" stackId="a" fill="#ef4444" name="Unprotected" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-green-500" />
                  <span className="text-sm">Protected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-yellow-500" />
                  <span className="text-sm">Partial</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-red-500" />
                  <span className="text-sm">Unprotected</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trend Insights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">+7.0%</div>
                <p className="text-sm text-muted-foreground">Coverage increase over 6 months</p>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>EC2 instances:</span>
                    <span className="text-green-600">+12.3%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>RDS databases:</span>
                    <span className="text-green-600">+5.8%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  Areas of Concern
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">3</div>
                <p className="text-sm text-muted-foreground">Services with declining coverage</p>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Lambda functions:</span>
                    <span className="text-red-600">-3.2%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>EKS clusters:</span>
                    <span className="text-red-600">-1.8%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-500" />
                  Next Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">24</div>
                <p className="text-sm text-muted-foreground">Recommended policy updates</p>
                <div className="mt-4">
                  <Button size="sm" className="w-full gap-2">
                    <Settings className="h-4 w-4" />
                    Review Recommendations
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
