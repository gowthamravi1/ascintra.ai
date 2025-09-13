"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Search,
  Download,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Play,
  Eye,
  Calendar,
  Database,
  Shield,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react"

interface ScanHistory {
  id: string
  accountName: string
  accountId: string
  type: "full" | "incremental" | "compliance" | "backup-validation"
  status: "completed" | "running" | "failed" | "cancelled"
  startTime: string
  endTime?: string
  duration: string
  resourcesScanned: number
  resourcesFound: number
  backupResourcesFound: number
  findings: {
    critical: number
    high: number
    medium: number
    low: number
  }
  recoveryScore: number
  backupCoverage: number
  triggeredBy: "scheduled" | "manual" | "api" | "webhook"
  region: string
  progress?: number
}

const scanHistory: ScanHistory[] = [
  {
    id: "scan-001",
    accountName: "Production Account",
    accountId: "123456789012",
    type: "full",
    status: "completed",
    startTime: "2024-01-08 14:30:00",
    endTime: "2024-01-08 15:15:23",
    duration: "45m 23s",
    resourcesScanned: 1247,
    resourcesFound: 1247,
    backupResourcesFound: 1089,
    findings: { critical: 3, high: 12, medium: 28, low: 156 },
    recoveryScore: 87,
    backupCoverage: 87.3,
    triggeredBy: "scheduled",
    region: "us-east-1",
  },
  {
    id: "scan-002",
    accountName: "Staging Account",
    accountId: "123456789013",
    type: "incremental",
    status: "running",
    startTime: "2024-01-08 15:45:00",
    duration: "12m 45s",
    resourcesScanned: 234,
    resourcesFound: 234,
    backupResourcesFound: 183,
    findings: { critical: 0, high: 2, medium: 8, low: 23 },
    recoveryScore: 78,
    backupCoverage: 78.2,
    triggeredBy: "manual",
    region: "us-west-2",
    progress: 65,
  },
  {
    id: "scan-003",
    accountName: "Development Account",
    accountId: "123456789014",
    type: "compliance",
    status: "failed",
    startTime: "2024-01-08 10:15:00",
    endTime: "2024-01-08 10:23:12",
    duration: "8m 12s",
    resourcesScanned: 0,
    resourcesFound: 0,
    backupResourcesFound: 0,
    findings: { critical: 0, high: 0, medium: 0, low: 0 },
    recoveryScore: 0,
    backupCoverage: 0,
    triggeredBy: "api",
    region: "eu-west-1",
  },
  {
    id: "scan-004",
    accountName: "Production Account",
    accountId: "123456789012",
    type: "backup-validation",
    status: "completed",
    startTime: "2024-01-07 22:00:00",
    endTime: "2024-01-07 23:12:45",
    duration: "1h 12m 45s",
    resourcesScanned: 1089,
    resourcesFound: 1089,
    backupResourcesFound: 1089,
    findings: { critical: 5, high: 18, medium: 45, low: 203 },
    recoveryScore: 92,
    backupCoverage: 100,
    triggeredBy: "scheduled",
    region: "us-east-1",
  },
  {
    id: "scan-005",
    accountName: "Backup Account",
    accountId: "123456789015",
    type: "full",
    status: "completed",
    startTime: "2024-01-07 16:30:00",
    endTime: "2024-01-07 17:23:45",
    duration: "53m 45s",
    resourcesScanned: 456,
    resourcesFound: 456,
    backupResourcesFound: 306,
    findings: { critical: 1, high: 4, medium: 12, low: 67 },
    recoveryScore: 71,
    backupCoverage: 67.1,
    triggeredBy: "manual",
    region: "ap-southeast-1",
  },
]

const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case "running":
      return <Clock className="h-4 w-4 text-blue-500" />
    case "failed":
      return <XCircle className="h-4 w-4 text-red-500" />
    case "cancelled":
      return <Minus className="h-4 w-4 text-gray-500" />
    default:
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />
  }
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "completed":
      return <Badge variant="success">Completed</Badge>
    case "running":
      return <Badge variant="info">Running</Badge>
    case "failed":
      return <Badge variant="destructive">Failed</Badge>
    case "cancelled":
      return <Badge variant="secondary">Cancelled</Badge>
    default:
      return <Badge variant="warning">Unknown</Badge>
  }
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case "full":
      return <Database className="h-4 w-4 text-blue-500" />
    case "incremental":
      return <Activity className="h-4 w-4 text-green-500" />
    case "compliance":
      return <Shield className="h-4 w-4 text-purple-500" />
    case "backup-validation":
      return <CheckCircle className="h-4 w-4 text-orange-500" />
    default:
      return <Search className="h-4 w-4 text-gray-500" />
  }
}

const getTypeBadge = (type: string) => {
  switch (type) {
    case "full":
      return <Badge variant="info">Full Scan</Badge>
    case "incremental":
      return <Badge variant="success">Incremental</Badge>
    case "compliance":
      return <Badge variant="warning">Compliance</Badge>
    case "backup-validation":
      return <Badge variant="secondary">Backup Validation</Badge>
    default:
      return <Badge variant="outline">Unknown</Badge>
  }
}

export default function DiscoveryHistory() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [accountFilter, setAccountFilter] = useState("all")
  const [selectedScan, setSelectedScan] = useState<ScanHistory | null>(null)

  const filteredScans = scanHistory.filter((scan) => {
    const matchesSearch =
      scan.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scan.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scan.accountId.includes(searchTerm)

    const matchesStatus = statusFilter === "all" || scan.status === statusFilter
    const matchesType = typeFilter === "all" || scan.type === typeFilter
    const matchesAccount = accountFilter === "all" || scan.accountName === accountFilter

    return matchesSearch && matchesStatus && matchesType && matchesAccount
  })

  const uniqueAccounts = Array.from(new Set(scanHistory.map((scan) => scan.accountName)))

  const completedScans = scanHistory.filter((scan) => scan.status === "completed")
  const avgDuration =
    completedScans.length > 0
      ? completedScans.reduce((sum, scan) => {
          const duration = scan.duration.includes("h")
            ? Number.parseInt(scan.duration) * 60 + Number.parseInt(scan.duration.split("h ")[1])
            : Number.parseInt(scan.duration)
          return sum + duration
        }, 0) / completedScans.length
      : 0

  const successRate = scanHistory.length > 0 ? (completedScans.length / scanHistory.length) * 100 : 0

  const totalResourcesScanned = scanHistory.reduce((sum, scan) => sum + scan.resourcesScanned, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Discovery History</h1>
          <p className="text-gray-600 dark:text-gray-400">
            View and analyze your AWS resource discovery and backup validation history
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm">
            <Play className="h-4 w-4 mr-2" />
            New Scan
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scanHistory.length}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +12 this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{successRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +2.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(avgDuration)}m</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingDown className="h-3 w-3" />
              -5m from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resources Scanned</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(totalResourcesScanned / 1000).toFixed(1)}K</div>
            <p className="text-xs text-muted-foreground">Total this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Discovery Scan History
          </CardTitle>
          <CardDescription>View and filter your resource discovery and backup validation history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by account, scan ID, or account ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={accountFilter} onValueChange={setAccountFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by account" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Accounts</SelectItem>
                {uniqueAccounts.map((account) => (
                  <SelectItem key={account} value={account}>
                    {account}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="running">Running</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="full">Full Scan</SelectItem>
                <SelectItem value="incremental">Incremental</SelectItem>
                <SelectItem value="compliance">Compliance</SelectItem>
                <SelectItem value="backup-validation">Backup Validation</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Scan History Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Scan Details</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Resources</TableHead>
                  <TableHead>Recovery Score</TableHead>
                  <TableHead>Backup Coverage</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredScans.map((scan) => (
                  <TableRow key={scan.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{scan.id}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Started: {scan.startTime}</div>
                        {scan.status === "running" && scan.progress && (
                          <div className="space-y-1">
                            <Progress value={scan.progress} className="h-1" />
                            <div className="text-xs text-gray-500">{scan.progress}% complete</div>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{scan.accountName}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {scan.accountId} • {scan.region}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(scan.type)}
                        {getTypeBadge(scan.type)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(scan.status)}
                        {getStatusBadge(scan.status)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{scan.duration}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{scan.triggeredBy}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{scan.resourcesScanned.toLocaleString()}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {scan.backupResourcesFound} with backups
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="font-medium">{scan.recoveryScore}</div>
                        <div className="w-12 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div className="bg-primary h-2 rounded-full" style={{ width: `${scan.recoveryScore}%` }} />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="font-medium">{scan.backupCoverage.toFixed(1)}%</div>
                        <div className="w-12 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: `${scan.backupCoverage}%` }} />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedScan(scan)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
                          <DialogHeader>
                            <DialogTitle>Scan Details: {scan.id}</DialogTitle>
                            <DialogDescription>Detailed information about the discovery scan</DialogDescription>
                          </DialogHeader>
                          {selectedScan && (
                            <div className="space-y-6">
                              <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                  <h4 className="font-medium">Scan Information</h4>
                                  <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-gray-600 dark:text-gray-400">Scan ID:</span>
                                      <span>{selectedScan.id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600 dark:text-gray-400">Type:</span>
                                      <span>{selectedScan.type}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600 dark:text-gray-400">Status:</span>
                                      <span>{selectedScan.status}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                                      <span>{selectedScan.duration}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600 dark:text-gray-400">Triggered By:</span>
                                      <span>{selectedScan.triggeredBy}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <h4 className="font-medium">Account Information</h4>
                                  <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-gray-600 dark:text-gray-400">Account:</span>
                                      <span>{selectedScan.accountName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600 dark:text-gray-400">Account ID:</span>
                                      <span>{selectedScan.accountId}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600 dark:text-gray-400">Region:</span>
                                      <span>{selectedScan.region}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="grid gap-4 md:grid-cols-3">
                                <Card>
                                  <CardHeader className="pb-2">
                                    <CardTitle className="text-sm">Resources Scanned</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="text-2xl font-bold">
                                      {selectedScan.resourcesScanned.toLocaleString()}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                      {selectedScan.backupResourcesFound} with backups
                                    </div>
                                  </CardContent>
                                </Card>
                                <Card>
                                  <CardHeader className="pb-2">
                                    <CardTitle className="text-sm">Recovery Score</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="text-2xl font-bold">{selectedScan.recoveryScore}</div>
                                    <Progress value={selectedScan.recoveryScore} className="h-2 mt-2" />
                                  </CardContent>
                                </Card>
                                <Card>
                                  <CardHeader className="pb-2">
                                    <CardTitle className="text-sm">Backup Coverage</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="text-2xl font-bold">{selectedScan.backupCoverage.toFixed(1)}%</div>
                                    <Progress value={selectedScan.backupCoverage} className="h-2 mt-2" />
                                  </CardContent>
                                </Card>
                              </div>

                              <div className="space-y-2">
                                <h4 className="font-medium">Recovery Findings</h4>
                                <div className="grid gap-2 md:grid-cols-4">
                                  <div className="flex items-center justify-between p-2 border rounded">
                                    <span className="text-sm">Critical</span>
                                    <Badge variant="destructive">{selectedScan.findings.critical}</Badge>
                                  </div>
                                  <div className="flex items-center justify-between p-2 border rounded">
                                    <span className="text-sm">High</span>
                                    <Badge variant="warning">{selectedScan.findings.high}</Badge>
                                  </div>
                                  <div className="flex items-center justify-between p-2 border rounded">
                                    <span className="text-sm">Medium</span>
                                    <Badge variant="info">{selectedScan.findings.medium}</Badge>
                                  </div>
                                  <div className="flex items-center justify-between p-2 border rounded">
                                    <span className="text-sm">Low</span>
                                    <Badge variant="secondary">{selectedScan.findings.low}</Badge>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
