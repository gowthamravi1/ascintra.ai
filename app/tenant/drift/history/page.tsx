"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertTriangle,
  Clock,
  Eye,
  Filter,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  RotateCcw,
  TrendingDown,
  Activity,
  FileText,
  User,
  Settings,
} from "lucide-react"

// Mock data for drift history
const driftHistory = [
  {
    id: "drift-hist-001",
    resourceId: "i-0abc123def456789",
    resourceName: "web-server-prod-01",
    service: "EC2",
    region: "us-east-1",
    provider: "AWS",
    severity: "High",
    issue: "Security group rules modified",
    detectedAt: "2024-01-19T08:15:00Z",
    resolvedAt: "2024-01-19T09:30:00Z",
    status: "Resolved",
    resolvedBy: "john.doe@company.com",
    resolutionMethod: "Automatic Fix",
    expectedConfig: "sg-0123456789abcdef0 (ports: 80, 443)",
    actualConfig: "sg-0123456789abcdef0 (ports: 80, 443, 22, 3389)",
    impact: "Unauthorized access risk",
    tags: { Environment: "Production", Team: "WebOps", Owner: "john.doe@company.com" },
    changeHistory: [
      {
        timestamp: "2024-01-19T08:15:00Z",
        action: "Drift Detected",
        user: "System",
        details: "Security group rules modified - ports 22, 3389 added",
      },
      {
        timestamp: "2024-01-19T08:20:00Z",
        action: "Alert Sent",
        user: "System",
        details: "High severity drift alert sent to WebOps team",
      },
      {
        timestamp: "2024-01-19T09:30:00Z",
        action: "Drift Resolved",
        user: "john.doe@company.com",
        details: "Automatic fix applied - unauthorized ports removed",
      },
    ],
  },
  {
    id: "drift-hist-002",
    resourceId: "vol-0def456ghi789abc",
    resourceName: "db-storage-prod",
    service: "EBS",
    region: "us-east-1",
    provider: "AWS",
    severity: "High",
    issue: "Encryption disabled",
    detectedAt: "2024-01-19T07:45:00Z",
    resolvedAt: "2024-01-19T10:15:00Z",
    status: "Resolved",
    resolvedBy: "jane.smith@company.com",
    resolutionMethod: "Manual Fix",
    expectedConfig:
      "Encrypted: true, KMS Key: arn:aws:kms:us-east-1:123456789012:key/12345678-1234-1234-1234-123456789012",
    actualConfig: "Encrypted: false",
    impact: "Data security compliance violation",
    tags: { Environment: "Production", Team: "DataOps", Owner: "jane.smith@company.com" },
    changeHistory: [
      {
        timestamp: "2024-01-19T07:45:00Z",
        action: "Drift Detected",
        user: "System",
        details: "EBS volume encryption disabled",
      },
      {
        timestamp: "2024-01-19T07:50:00Z",
        action: "Alert Sent",
        user: "System",
        details: "Critical security drift alert sent to DataOps and Security teams",
      },
      {
        timestamp: "2024-01-19T10:15:00Z",
        action: "Drift Resolved",
        user: "jane.smith@company.com",
        details: "Manual fix applied - encryption re-enabled with KMS key",
      },
    ],
  },
  {
    id: "drift-hist-003",
    resourceId: "lb-0ghi789jkl012mno",
    resourceName: "api-loadbalancer",
    service: "ALB",
    region: "us-west-2",
    provider: "AWS",
    severity: "Medium",
    issue: "Health check configuration changed",
    detectedAt: "2024-01-19T06:30:00Z",
    resolvedAt: null,
    status: "Ignored",
    resolvedBy: "mike.johnson@company.com",
    resolutionMethod: "Ignored",
    expectedConfig: "Health check path: /health, Interval: 30s, Timeout: 5s",
    actualConfig: "Health check path: /status, Interval: 60s, Timeout: 10s",
    impact: "Reduced monitoring accuracy",
    tags: { Environment: "Production", Team: "Platform", Owner: "mike.johnson@company.com" },
    changeHistory: [
      {
        timestamp: "2024-01-19T06:30:00Z",
        action: "Drift Detected",
        user: "System",
        details: "Health check configuration modified",
      },
      {
        timestamp: "2024-01-19T06:35:00Z",
        action: "Alert Sent",
        user: "System",
        details: "Medium severity drift alert sent to Platform team",
      },
      {
        timestamp: "2024-01-19T11:00:00Z",
        action: "Drift Ignored",
        user: "mike.johnson@company.com",
        details: "Drift marked as acceptable - new health check path approved",
      },
    ],
  },
  {
    id: "drift-hist-004",
    resourceId: "rds-0pqr345stu678vwx",
    resourceName: "user-database",
    service: "RDS",
    region: "us-east-1",
    provider: "AWS",
    severity: "High",
    issue: "Backup retention changed",
    detectedAt: "2024-01-18T15:15:00Z",
    resolvedAt: "2024-01-18T16:45:00Z",
    status: "Resolved",
    resolvedBy: "sarah.wilson@company.com",
    resolutionMethod: "Automatic Fix",
    expectedConfig: "Backup retention: 30 days, Automated backups: enabled",
    actualConfig: "Backup retention: 7 days, Automated backups: enabled",
    impact: "Reduced disaster recovery capability",
    tags: { Environment: "Production", Team: "DataOps", Owner: "sarah.wilson@company.com" },
    changeHistory: [
      {
        timestamp: "2024-01-18T15:15:00Z",
        action: "Drift Detected",
        user: "System",
        details: "RDS backup retention period reduced from 30 to 7 days",
      },
      {
        timestamp: "2024-01-18T15:20:00Z",
        action: "Alert Sent",
        user: "System",
        details: "High severity drift alert sent to DataOps team",
      },
      {
        timestamp: "2024-01-18T16:45:00Z",
        action: "Drift Resolved",
        user: "sarah.wilson@company.com",
        details: "Automatic fix applied - backup retention restored to 30 days",
      },
    ],
  },
  {
    id: "drift-hist-005",
    resourceId: "sg-0yza123bcd456efg",
    resourceName: "database-security-group",
    service: "Security Group",
    region: "us-east-1",
    provider: "AWS",
    severity: "Critical",
    issue: "Inbound rules modified",
    detectedAt: "2024-01-18T14:00:00Z",
    resolvedAt: "2024-01-18T14:05:00Z",
    status: "Resolved",
    resolvedBy: "alex.brown@company.com",
    resolutionMethod: "Emergency Fix",
    expectedConfig: "Inbound: 3306 from sg-0123456789abcdef0 only",
    actualConfig: "Inbound: 3306 from 0.0.0.0/0",
    impact: "Database exposed to internet",
    tags: { Environment: "Production", Team: "Security", Owner: "alex.brown@company.com" },
    changeHistory: [
      {
        timestamp: "2024-01-18T14:00:00Z",
        action: "Drift Detected",
        user: "System",
        details: "Critical security drift - database exposed to internet",
      },
      {
        timestamp: "2024-01-18T14:01:00Z",
        action: "Emergency Alert",
        user: "System",
        details: "Critical security alert sent to Security and DataOps teams",
      },
      {
        timestamp: "2024-01-18T14:05:00Z",
        action: "Emergency Fix",
        user: "alex.brown@company.com",
        details: "Emergency fix applied - database access restricted to authorized security group",
      },
    ],
  },
]

const driftStats = {
  totalDrifts: 156,
  resolvedDrifts: 142,
  ignoredDrifts: 8,
  activeDrifts: 6,
  averageResolutionTime: "2.3 hours",
  criticalDrifts: 12,
  highDrifts: 34,
  mediumDrifts: 67,
  lowDrifts: 43,
}

const trendData = [
  { period: "Last 7 days", detected: 23, resolved: 21, ignored: 2 },
  { period: "Last 30 days", detected: 89, resolved: 82, ignored: 5 },
  { period: "Last 90 days", detected: 156, resolved: 142, ignored: 8 },
]

export default function DriftHistoryPage() {
  const [selectedDrifts, setSelectedDrifts] = useState<string[]>([])
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterSeverity, setFilterSeverity] = useState<string>("all")
  const [filterService, setFilterService] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [dateRange, setDateRange] = useState<string>("7d")

  const handleSelectDrift = (driftId: string) => {
    setSelectedDrifts((prev) => (prev.includes(driftId) ? prev.filter((id) => id !== driftId) : [...prev, driftId]))
  }

  const handleSelectAll = () => {
    const allIds = filteredDrifts.map((drift) => drift.id)
    setSelectedDrifts(selectedDrifts.length === allIds.length ? [] : allIds)
  }

  const handleExportData = () => {
    // Handle export logic here
    console.log("Exporting drift history data...")
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "destructive"
      case "High":
        return "destructive"
      case "Medium":
        return "default"
      case "Low":
        return "secondary"
      default:
        return "default"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Resolved":
        return "default"
      case "Ignored":
        return "secondary"
      case "Active":
        return "destructive"
      default:
        return "default"
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "Critical":
        return <XCircle className="h-4 w-4" />
      case "High":
        return <XCircle className="h-4 w-4" />
      case "Medium":
        return <AlertCircle className="h-4 w-4" />
      case "Low":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const filteredDrifts = driftHistory.filter((drift) => {
    const matchesStatus = filterStatus === "all" || drift.status.toLowerCase() === filterStatus.toLowerCase()
    const matchesSeverity = filterSeverity === "all" || drift.severity.toLowerCase() === filterSeverity.toLowerCase()
    const matchesService = filterService === "all" || drift.service.toLowerCase() === filterService.toLowerCase()
    const matchesSearch =
      searchQuery === "" ||
      drift.resourceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drift.issue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drift.resourceId.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesStatus && matchesSeverity && matchesService && matchesSearch
  })

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Configuration Drift History</h1>
          <p className="text-muted-foreground">
            Historical view of all configuration drift events and their resolutions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportData}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate Drift History Report</DialogTitle>
                <DialogDescription>Generate a comprehensive report of configuration drift history</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="report-period">Report Period</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">Last 7 days</SelectItem>
                      <SelectItem value="30d">Last 30 days</SelectItem>
                      <SelectItem value="90d">Last 90 days</SelectItem>
                      <SelectItem value="custom">Custom range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Include Sections</Label>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="summary" defaultChecked />
                      <Label htmlFor="summary">Executive Summary</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="trends" defaultChecked />
                      <Label htmlFor="trends">Trend Analysis</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="details" defaultChecked />
                      <Label htmlFor="details">Detailed Drift Events</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="recommendations" defaultChecked />
                      <Label htmlFor="recommendations">Recommendations</Label>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="report-format">Report Format</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF Report</SelectItem>
                      <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                      <SelectItem value="csv">CSV Data</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button>
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Drift Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{driftStats.totalDrifts}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{driftStats.resolvedDrifts}</div>
            <p className="text-xs text-muted-foreground">
              {((driftStats.resolvedDrifts / driftStats.totalDrifts) * 100).toFixed(1)}% resolution rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{driftStats.activeDrifts}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Resolution Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{driftStats.averageResolutionTime}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingDown className="h-3 w-3 inline mr-1" />
              15% faster than last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter drift history by various criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search resources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="ignored">Ignored</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="severity-filter">Severity</Label>
              <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                <SelectTrigger>
                  <SelectValue placeholder="All severities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="service-filter">Service</Label>
              <Select value={filterService} onValueChange={setFilterService}>
                <SelectTrigger>
                  <SelectValue placeholder="All services" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  <SelectItem value="ec2">EC2</SelectItem>
                  <SelectItem value="ebs">EBS</SelectItem>
                  <SelectItem value="alb">ALB</SelectItem>
                  <SelectItem value="rds">RDS</SelectItem>
                  <SelectItem value="security group">Security Group</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="date-range">Time Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different views */}
      <Tabs defaultValue="history" className="space-y-4">
        <TabsList>
          <TabsTrigger value="history">Drift History</TabsTrigger>
          <TabsTrigger value="trends">Trends & Analytics</TabsTrigger>
          <TabsTrigger value="timeline">Timeline View</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-4">
          {/* Drift History Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Configuration Drift History</CardTitle>
                  <CardDescription>
                    Showing {filteredDrifts.length} of {driftHistory.length} drift events
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleSelectAll}>
                    {selectedDrifts.length === filteredDrifts.length ? "Deselect All" : "Select All"}
                  </Button>
                  <Button variant="outline" size="sm" disabled={selectedDrifts.length === 0}>
                    <Filter className="h-4 w-4 mr-2" />
                    Bulk Actions ({selectedDrifts.length})
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedDrifts.length === filteredDrifts.length && filteredDrifts.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Issue</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Detected</TableHead>
                    <TableHead>Resolved</TableHead>
                    <TableHead>Resolution Time</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDrifts.map((drift) => {
                    const resolutionTime = drift.resolvedAt
                      ? Math.round(
                          (new Date(drift.resolvedAt).getTime() - new Date(drift.detectedAt).getTime()) / (1000 * 60),
                        )
                      : null

                    return (
                      <TableRow key={drift.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedDrifts.includes(drift.id)}
                            onCheckedChange={() => handleSelectDrift(drift.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{drift.resourceName}</div>
                            <div className="text-sm text-muted-foreground">{drift.resourceId}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{drift.service}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate">{drift.issue}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getSeverityColor(drift.severity)}>
                            {getSeverityIcon(drift.severity)}
                            <span className="ml-1">{drift.severity}</span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(drift.status)}>{drift.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(drift.detectedAt).toLocaleDateString()}
                            <div className="text-xs text-muted-foreground">
                              {new Date(drift.detectedAt).toLocaleTimeString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {drift.resolvedAt ? (
                            <div className="text-sm">
                              {new Date(drift.resolvedAt).toLocaleDateString()}
                              <div className="text-xs text-muted-foreground">
                                {new Date(drift.resolvedAt).toLocaleTimeString()}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {resolutionTime ? (
                            <span className="text-sm">
                              {resolutionTime < 60
                                ? `${resolutionTime}m`
                                : `${Math.round(resolutionTime / 60)}h ${resolutionTime % 60}m`}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Eye className="h-3 w-3 mr-1" />
                                Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>{drift.resourceName} - Drift Details</DialogTitle>
                                <DialogDescription>
                                  Complete information about this configuration drift event
                                </DialogDescription>
                              </DialogHeader>

                              <div className="space-y-6">
                                {/* Resource Information */}
                                <div>
                                  <h4 className="font-medium mb-3">Resource Information</h4>
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <strong>Resource Name:</strong> {drift.resourceName}
                                    </div>
                                    <div>
                                      <strong>Resource ID:</strong> {drift.resourceId}
                                    </div>
                                    <div>
                                      <strong>Service:</strong> {drift.service}
                                    </div>
                                    <div>
                                      <strong>Region:</strong> {drift.region}
                                    </div>
                                    <div>
                                      <strong>Provider:</strong> {drift.provider}
                                    </div>
                                    <div>
                                      <strong>Severity:</strong>
                                      <Badge variant={getSeverityColor(drift.severity)} className="ml-2">
                                        {drift.severity}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>

                                {/* Drift Details */}
                                <div>
                                  <h4 className="font-medium mb-3">Drift Details</h4>
                                  <div className="space-y-3">
                                    <div>
                                      <strong>Issue:</strong> {drift.issue}
                                    </div>
                                    <div>
                                      <strong>Impact:</strong> {drift.impact}
                                    </div>
                                    <div>
                                      <strong>Status:</strong>
                                      <Badge variant={getStatusColor(drift.status)} className="ml-2">
                                        {drift.status}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>

                                {/* Configuration Comparison */}
                                <div>
                                  <h4 className="font-medium mb-3">Configuration Comparison</h4>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label className="text-xs text-green-600">Expected Configuration</Label>
                                      <div className="bg-green-50 border border-green-200 p-3 rounded text-sm">
                                        {drift.expectedConfig}
                                      </div>
                                    </div>
                                    <div>
                                      <Label className="text-xs text-red-600">Actual Configuration</Label>
                                      <div className="bg-red-50 border border-red-200 p-3 rounded text-sm">
                                        {drift.actualConfig}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Resolution Information */}
                                {drift.status === "Resolved" && (
                                  <div>
                                    <h4 className="font-medium mb-3">Resolution Information</h4>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <strong>Resolved By:</strong> {drift.resolvedBy}
                                      </div>
                                      <div>
                                        <strong>Resolution Method:</strong> {drift.resolutionMethod}
                                      </div>
                                      <div>
                                        <strong>Resolved At:</strong>{" "}
                                        {drift.resolvedAt ? new Date(drift.resolvedAt).toLocaleString() : "-"}
                                      </div>
                                      <div>
                                        <strong>Resolution Time:</strong>
                                        {resolutionTime ? (
                                          <span className="ml-1">
                                            {resolutionTime < 60
                                              ? `${resolutionTime} minutes`
                                              : `${Math.round(resolutionTime / 60)} hours ${resolutionTime % 60} minutes`}
                                          </span>
                                        ) : (
                                          "-"
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Resource Tags */}
                                <div>
                                  <h4 className="font-medium mb-3">Resource Tags</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {Object.entries(drift.tags).map(([key, value]) => (
                                      <Badge key={key} variant="outline" className="text-xs">
                                        {key}: {value}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>

                                {/* Change History */}
                                <div>
                                  <h4 className="font-medium mb-3">Change History</h4>
                                  <div className="space-y-3">
                                    {drift.changeHistory.map((change, index) => (
                                      <div key={index} className="flex items-start gap-3 p-3 border rounded">
                                        <div className="flex-shrink-0">
                                          {change.action === "Drift Detected" && (
                                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                                          )}
                                          {change.action === "Alert Sent" && (
                                            <Activity className="h-4 w-4 text-blue-500" />
                                          )}
                                          {change.action === "Emergency Alert" && (
                                            <XCircle className="h-4 w-4 text-red-500" />
                                          )}
                                          {(change.action === "Drift Resolved" ||
                                            change.action === "Emergency Fix") && (
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                          )}
                                          {change.action === "Drift Ignored" && (
                                            <Settings className="h-4 w-4 text-gray-500" />
                                          )}
                                        </div>
                                        <div className="flex-1">
                                          <div className="flex items-center justify-between">
                                            <strong className="text-sm">{change.action}</strong>
                                            <span className="text-xs text-muted-foreground">
                                              {new Date(change.timestamp).toLocaleString()}
                                            </span>
                                          </div>
                                          <div className="text-sm text-muted-foreground mt-1">
                                            <User className="h-3 w-3 inline mr-1" />
                                            {change.user}
                                          </div>
                                          <div className="text-sm mt-1">{change.details}</div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              <DialogFooter>
                                <Button variant="outline">Close</Button>
                                {drift.status === "Active" && (
                                  <Button>
                                    <RotateCcw className="h-4 w-4 mr-2" />
                                    Resolve Drift
                                  </Button>
                                )}
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          {/* Trends and Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Drift Trends</CardTitle>
                <CardDescription>Drift detection and resolution trends over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trendData.map((trend, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{trend.period}</span>
                        <div className="flex gap-4 text-sm">
                          <span className="text-orange-600">Detected: {trend.detected}</span>
                          <span className="text-green-600">Resolved: {trend.resolved}</span>
                          <span className="text-gray-600">Ignored: {trend.ignored}</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${(trend.resolved / trend.detected) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Severity Distribution</CardTitle>
                <CardDescription>Breakdown of drift events by severity level</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span>Critical</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{driftStats.criticalDrifts}</span>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-red-500 h-2 rounded-full"
                          style={{ width: `${(driftStats.criticalDrifts / driftStats.totalDrifts) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-orange-500" />
                      <span>High</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{driftStats.highDrifts}</span>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-orange-500 h-2 rounded-full"
                          style={{ width: `${(driftStats.highDrifts / driftStats.totalDrifts) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                      <span>Medium</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{driftStats.mediumDrifts}</span>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-500 h-2 rounded-full"
                          style={{ width: `${(driftStats.mediumDrifts / driftStats.totalDrifts) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Low</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{driftStats.lowDrifts}</span>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${(driftStats.lowDrifts / driftStats.totalDrifts) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          {/* Timeline View */}
          <Card>
            <CardHeader>
              <CardTitle>Drift Timeline</CardTitle>
              <CardDescription>Chronological view of drift events and resolutions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {driftHistory
                  .sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime())
                  .map((drift, index) => (
                    <div key={drift.id} className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                      <div className="flex-1 pb-6 border-l border-gray-200 pl-4 ml-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant={getSeverityColor(drift.severity)}>
                              {getSeverityIcon(drift.severity)}
                              <span className="ml-1">{drift.severity}</span>
                            </Badge>
                            <Badge variant={getStatusColor(drift.status)}>{drift.status}</Badge>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(drift.detectedAt).toLocaleString()}
                          </span>
                        </div>
                        <h4 className="font-medium">{drift.resourceName}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{drift.issue}</p>
                        <div className="text-xs text-muted-foreground">
                          {drift.service} • {drift.region} • {drift.resourceId}
                        </div>
                        {drift.resolvedAt && (
                          <div className="mt-2 text-xs text-green-600">
                            ✓ Resolved by {drift.resolvedBy} at {new Date(drift.resolvedAt).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
