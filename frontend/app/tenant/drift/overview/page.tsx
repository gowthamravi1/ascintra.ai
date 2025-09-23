"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertTriangle,
  Shield,
  Clock,
  MapPin,
  Eye,
  Settings,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Wrench,
  Play,
  Pause,
} from "lucide-react"

// Mock defaults; will be replaced by API values
const driftSummaryDefault = {
  totalResources: 1247,
  driftingResources: 23,
  criticalDrift: 8,
  mediumDrift: 11,
  lowDrift: 4,
  lastScan: "2024-01-19T10:30:00Z",
  nextScan: "2024-01-19T14:30:00Z",
}

const driftDataDefault = [
  {
    id: "drift-001",
    resourceId: "i-0abc123def456789",
    resourceName: "web-server-prod-01",
    service: "EC2",
    region: "us-east-1",
    provider: "AWS",
    severity: "High",
    issue: "Security group rules modified",
    detectedAt: "2024-01-19T08:15:00Z",
    expectedConfig: "sg-0123456789abcdef0 (ports: 80, 443)",
    currentConfig: "sg-0123456789abcdef0 (ports: 80, 443, 22, 3389)",
    impact: "Unauthorized access risk",
    tags: { Environment: "Production", Team: "WebOps", Owner: "john.doe@company.com" },
  },
  {
    id: "drift-002",
    resourceId: "vol-0def456ghi789abc",
    resourceName: "db-storage-prod",
    service: "EBS",
    region: "us-east-1",
    provider: "AWS",
    severity: "High",
    issue: "Encryption disabled",
    detectedAt: "2024-01-19T07:45:00Z",
    expectedConfig:
      "Encrypted: true, KMS Key: arn:aws:kms:us-east-1:123456789012:key/12345678-1234-1234-1234-123456789012",
    currentConfig: "Encrypted: false",
    impact: "Data security compliance violation",
    tags: { Environment: "Production", Team: "DataOps", Owner: "jane.smith@company.com" },
  },
  {
    id: "drift-003",
    resourceId: "lb-0ghi789jkl012mno",
    resourceName: "api-loadbalancer",
    service: "ALB",
    region: "us-west-2",
    provider: "AWS",
    severity: "Medium",
    issue: "Health check configuration changed",
    detectedAt: "2024-01-19T06:30:00Z",
    expectedConfig: "Health check path: /health, Interval: 30s, Timeout: 5s",
    currentConfig: "Health check path: /status, Interval: 60s, Timeout: 10s",
    impact: "Reduced monitoring accuracy",
    tags: { Environment: "Production", Team: "Platform", Owner: "mike.johnson@company.com" },
  },
  {
    id: "drift-004",
    resourceId: "rds-0pqr345stu678vwx",
    resourceName: "user-database",
    service: "RDS",
    region: "us-east-1",
    provider: "AWS",
    severity: "High",
    issue: "Backup retention changed",
    detectedAt: "2024-01-19T05:15:00Z",
    expectedConfig: "Backup retention: 30 days, Automated backups: enabled",
    currentConfig: "Backup retention: 7 days, Automated backups: enabled",
    impact: "Reduced disaster recovery capability",
    tags: { Environment: "Production", Team: "DataOps", Owner: "sarah.wilson@company.com" },
  },
  {
    id: "drift-005",
    resourceId: "sg-0yza123bcd456efg",
    resourceName: "database-security-group",
    service: "Security Group",
    region: "us-east-1",
    provider: "AWS",
    severity: "High",
    issue: "Inbound rules modified",
    detectedAt: "2024-01-19T04:00:00Z",
    expectedConfig: "Inbound: 3306 from sg-0123456789abcdef0 only",
    currentConfig: "Inbound: 3306 from 0.0.0.0/0",
    impact: "Database exposed to internet",
    tags: { Environment: "Production", Team: "Security", Owner: "alex.brown@company.com" },
  },
]

const geographicData = [
  { region: "us-east-1", driftCount: 12, severity: "High" },
  { region: "us-west-2", driftCount: 8, severity: "Medium" },
  { region: "eu-west-1", driftCount: 3, severity: "Low" },
]

const recommendations = [
  {
    id: "rec-001",
    title: "Enable automated drift detection",
    description: "Set up continuous monitoring to detect configuration changes in real-time",
    priority: "High",
    estimatedTime: "2 hours",
    resources: 15,
  },
  {
    id: "rec-002",
    title: "Implement infrastructure as code",
    description: "Use Terraform or CloudFormation to manage infrastructure declaratively",
    priority: "High",
    estimatedTime: "1 week",
    resources: 1247,
  },
  {
    id: "rec-003",
    title: "Set up drift alerts",
    description: "Configure notifications for critical configuration changes",
    priority: "Medium",
    estimatedTime: "1 hour",
    resources: 23,
  },
]

export default function DriftOverviewPage() {
  const [selectedResources, setSelectedResources] = useState<string[]>([])
  const [isFixingAll, setIsFixingAll] = useState(false)
  const [fixProgress, setFixProgress] = useState(0)
  const [isFixingIndividual, setIsFixingIndividual] = useState<string | null>(null)
  const [individualProgress, setIndividualProgress] = useState(0)
  const [scheduleDate, setScheduleDate] = useState("")
  const [scheduleTime, setScheduleTime] = useState("")
  const [notificationEmail, setNotificationEmail] = useState("")
  const [scheduleNotes, setScheduleNotes] = useState("")
  const [selectedRecommendations, setSelectedRecommendations] = useState<string[]>([])
  const [summary, setSummary] = useState(driftSummaryDefault)
  const [rows, setRows] = useState(driftDataDefault)

  const [selectedDriftItem, setSelectedDriftItem] = useState<any>(null)
  const [driftDetails, setDriftDetails] = useState<any>(null)
  const [loadingDetails, setLoadingDetails] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/tenant/drift/overview?account_identifier=142141431503", { cache: "no-store" })
        if (!res.ok) return
        const data = await res.json()
        if (data?.summary) setSummary(data.summary)
        if (Array.isArray(data?.items)) setRows(data.items)
      } catch {}
    }
    load()
  }, [])

  const handleViewDetails = async (item: any) => {
    setSelectedDriftItem(item)
    setLoadingDetails(true)
    try {
      const res = await fetch(`/api/tenant/drift/resource/${item.asset_id}?account_identifier=142141431503`)
      if (res.ok) {
        const data = await res.json()
        setDriftDetails(data.data)
      }
    } catch (e) {
      console.error('Failed to load drift details:', e)
    } finally {
      setLoadingDetails(false)
    }
  }

  const handleSelectResource = (resourceId: string) => {
    setSelectedResources((prev) =>
      prev.includes(resourceId) ? prev.filter((id) => id !== resourceId) : [...prev, resourceId],
    )
  }

  const handleSelectAllCritical = () => {
    const criticalResources = rows.filter((item) => item.severity === "High").map((item) => item.id)
    setSelectedResources(criticalResources)
  }

  const handleFixAll = async () => {
    setIsFixingAll(true)
    setFixProgress(0)

    // Simulate fix progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 200))
      setFixProgress(i)
    }

    setIsFixingAll(false)
    setSelectedResources([])
  }

  const handleFixIndividual = async (resourceId: string) => {
    setIsFixingIndividual(resourceId)
    setIndividualProgress(0)

    // Simulate fix progress
    for (let i = 0; i <= 100; i += 20) {
      await new Promise((resolve) => setTimeout(resolve, 300))
      setIndividualProgress(i)
    }

    setIsFixingIndividual(null)
  }

  const handleScheduleFix = () => {
    // Handle scheduling logic here
    console.log("Scheduling fix for:", { scheduleDate, scheduleTime, notificationEmail, scheduleNotes })
  }

  const handleApplyRecommendations = () => {
    // Handle applying recommendations
    console.log("Applying recommendations:", selectedRecommendations)
  }

  const handleSelectRecommendation = (recId: string) => {
    setSelectedRecommendations((prev) => (prev.includes(recId) ? prev.filter((id) => id !== recId) : [...prev, recId]))
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
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

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Configuration Drift Overview</h1>
          <p className="text-muted-foreground">Monitor and manage configuration drift across your infrastructure</p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive" disabled={selectedResources.length === 0}>
                <Wrench className="h-4 w-4 mr-2" />
                Fix All Critical ({rows.filter((d) => d.severity === "High").length})
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Fix All Critical Drift Issues</DialogTitle>
                <DialogDescription>
                  This will attempt to fix all critical configuration drift issues. Please review the changes before
                  proceeding.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Select resources to fix:</Label>
                  <Button variant="outline" size="sm" onClick={handleSelectAllCritical}>
                    Select All Critical
                  </Button>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-2">
                  {rows
                    .filter((item) => item.severity === "High")
                    .map((item) => (
                      <div key={item.id} className="flex items-center space-x-2 p-2 border rounded">
                        <Checkbox
                          checked={selectedResources.includes(item.id)}
                          onCheckedChange={() => handleSelectResource(item.id)}
                        />
                        <div className="flex-1">
                          <div className="font-medium">{item.resourceName}</div>
                          <div className="text-sm text-muted-foreground">
                            {item.service} • {item.region} • {item.issue}
                          </div>
                        </div>
                        <Badge variant={getSeverityColor(item.severity)}>{item.severity}</Badge>
                      </div>
                    ))}
                </div>

                {isFixingAll && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Fixing resources...</span>
                      <span>{fixProgress}%</span>
                    </div>
                    <Progress value={fixProgress} />
                  </div>
                )}

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-800">Warning</h4>
                      <p className="text-sm text-yellow-700">
                        These changes will be applied immediately and may affect running services. A rollback window of
                        24 hours will be available.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button
                  variant="destructive"
                  onClick={handleFixAll}
                  disabled={selectedResources.length === 0 || isFixingAll}
                >
                  {isFixingAll ? (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      Fixing...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Fix Selected ({selectedResources.length})
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Fix
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schedule Configuration Fix</DialogTitle>
                <DialogDescription>Schedule drift fixes to run at a specific time</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="schedule-date">Date</Label>
                    <Input
                      id="schedule-date"
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                  <div>
                    <Label htmlFor="schedule-time">Time</Label>
                    <Input
                      id="schedule-time"
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notification-email">Notification Email</Label>
                  <Input
                    id="notification-email"
                    type="email"
                    placeholder="admin@company.com"
                    value={notificationEmail}
                    onChange={(e) => setNotificationEmail(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="schedule-notes">Notes (Optional)</Label>
                  <Textarea
                    id="schedule-notes"
                    placeholder="Add any notes about this scheduled fix..."
                    value={scheduleNotes}
                    onChange={(e) => setScheduleNotes(e.target.value)}
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-800">Scheduled Fix Summary</h4>
                      <p className="text-sm text-blue-700">
                        {selectedResources.length} resources will be fixed on {scheduleDate} at {scheduleTime}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button onClick={handleScheduleFix} disabled={!scheduleDate || !scheduleTime || !notificationEmail}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Fix
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Resources</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalResources.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Monitored resources</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drifting Resources</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{summary.driftingResources}</div>
            <p className="text-xs text-muted-foreground">
              {((summary.driftingResources / Math.max(summary.totalResources, 1)) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{summary.criticalDrift}</div>
            <p className="text-xs text-muted-foreground">Require immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Scan</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date(summary.lastScan).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Next scan at{" "}
              {summary.nextScan ? new Date(summary.nextScan).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }) : ""}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Drift Analysis Table */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration Drift Analysis</CardTitle>
          <CardDescription>Resources with configuration drift detected in the last 24 hours</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Resource</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Issue</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Detected</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{item.resourceName}</div>
                      <div className="text-sm text-muted-foreground">{item.resourceId}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.service}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {item.region}
                    </div>
                  </TableCell>
                  <TableCell>{item.issue}</TableCell>
                  <TableCell>
                    <Badge variant={getSeverityColor(item.severity)}>
                      {getSeverityIcon(item.severity)}
                      <span className="ml-1">{item.severity}</span>
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(item.detectedAt).toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Wrench className="h-3 w-3 mr-1" />
                            Fix Drift
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Fix Configuration Drift</DialogTitle>
                            <DialogDescription>Fix drift for {item.resourceName}</DialogDescription>
                          </DialogHeader>

                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium mb-2">Resource Details</h4>
                              <div className="bg-gray-50 p-3 rounded text-sm space-y-1">
                                <div>
                                  <strong>Resource:</strong> {item.resourceName}
                                </div>
                                <div>
                                  <strong>Service:</strong> {item.service}
                                </div>
                                <div>
                                  <strong>Issue:</strong> {item.issue}
                                </div>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-medium mb-2">Configuration Changes</h4>
                              <div className="space-y-2">
                                <div>
                                  <Label className="text-xs text-red-600">Current (Incorrect)</Label>
                                  <div className="bg-red-50 border border-red-200 p-2 rounded text-sm">
                                    {item.currentConfig}
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-xs text-green-600">Expected (Correct)</Label>
                                  <div className="bg-green-50 border border-green-200 p-2 rounded text-sm">
                                    {item.expectedConfig}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {isFixingIndividual === item.id && (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span>Applying fix...</span>
                                  <span>{individualProgress}%</span>
                                </div>
                                <Progress value={individualProgress} />
                              </div>
                            )}

                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                              <div className="flex items-start gap-2">
                                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                                <div className="text-sm">
                                  <strong className="text-yellow-800">Impact:</strong>
                                  <p className="text-yellow-700">{item.impact}</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          <DialogFooter>
                            <Button variant="outline">Cancel</Button>
                            <Button
                              onClick={() => handleFixIndividual(item.id)}
                              disabled={isFixingIndividual === item.id}
                            >
                              {isFixingIndividual === item.id ? (
                                <>
                                  <Pause className="h-4 w-4 mr-2" />
                                  Fixing...
                                </>
                              ) : (
                                <>
                                  <Play className="h-4 w-4 mr-2" />
                                  Apply Fix
                                </>
                              )}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <Drawer>
                        <DrawerTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => handleViewDetails(item)}>
                            <Eye className="h-3 w-3 mr-1" />
                            View Details
                          </Button>
                        </DrawerTrigger>
                        <DrawerContent>
                          <DrawerHeader>
                            <DrawerTitle>{selectedDriftItem?.resource_name || item.resourceName} - Configuration Details</DrawerTitle>
                            <DrawerDescription>Detailed information about the configuration drift</DrawerDescription>
                          </DrawerHeader>

                          <div className="px-4 pb-4 space-y-6">
                            {loadingDetails ? (
                              <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                                <span className="ml-2">Loading drift details...</span>
                              </div>
                            ) : driftDetails ? (
                              <>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-medium mb-2">Resource Information</h4>
                                    <div className="space-y-2 text-sm">
                                      <div>
                                        <strong>Resource ID:</strong> {driftDetails.resource_id}
                                      </div>
                                      <div>
                                        <strong>Service:</strong> {driftDetails.service}
                                      </div>
                                      <div>
                                        <strong>Region:</strong> {driftDetails.region || 'N/A'}
                                      </div>
                                      <div>
                                        <strong>Provider:</strong> {driftDetails.provider}
                                      </div>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-medium mb-2">Drift Summary</h4>
                                    <div className="space-y-2 text-sm">
                                      <div>
                                        <strong>Total Changes:</strong> {driftDetails.detailed_comparison?.summary?.total_changes || 0}
                                      </div>
                                      <div>
                                        <strong>High Risk:</strong> {driftDetails.detailed_comparison?.summary?.high_risk_changes || 0}
                                      </div>
                                      <div>
                                        <strong>Medium Risk:</strong> {driftDetails.detailed_comparison?.summary?.medium_risk_changes || 0}
                                      </div>
                                      <div>
                                        <strong>Low Risk:</strong> {driftDetails.detailed_comparison?.summary?.low_risk_changes || 0}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {driftDetails.drift_changes && driftDetails.drift_changes.length > 0 && (
                                  <div>
                                    <h4 className="font-medium mb-2">Configuration Changes</h4>
                                    <div className="space-y-3">
                                      {driftDetails.drift_changes.map((change: any, index: number) => (
                                        <div key={index} className="border rounded-lg p-3">
                                          <div className="flex items-center justify-between mb-2">
                                            <span className="font-medium">{change.field}</span>
                                            <Badge variant="outline">{change.change_type}</Badge>
                                          </div>
                                          <div className="grid grid-cols-2 gap-3">
                                            <div>
                                              <Label className="text-xs text-red-600">Current Value</Label>
                                              <div className="bg-red-50 border border-red-200 p-2 rounded text-xs font-mono">
                                                {JSON.stringify(change.current_value, null, 2)}
                                              </div>
                                            </div>
                                            <div>
                                              <Label className="text-xs text-green-600">Historical Value</Label>
                                              <div className="bg-green-50 border border-green-200 p-2 rounded text-xs font-mono">
                                                {JSON.stringify(change.historical_value, null, 2)}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                <div>
                                  <h4 className="font-medium mb-2">Timeline</h4>
                                  <div className="space-y-2">
                                    {driftDetails.history_timeline?.map((entry: any, index: number) => (
                                      <div key={index} className="flex items-center justify-between text-sm border-b pb-2">
                                        <span>{new Date(entry.timestamp).toLocaleString()}</span>
                                        <Badge variant="outline">{entry.changes} changes</Badge>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </>
                            ) : (
                              <div className="text-center py-8 text-muted-foreground">
                                No drift details available
                              </div>
                            )}
                          </div>

                          <DrawerFooter>
                            <Button>Apply Fix</Button>
                            <DrawerClose asChild>
                              <Button variant="outline">Close</Button>
                            </DrawerClose>
                          </DrawerFooter>
                        </DrawerContent>
                      </Drawer>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Geographic Distribution and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Geographic Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Geographic Drift Distribution</CardTitle>
            <CardDescription>Configuration drift by AWS region</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {geographicData.map((region) => (
                <div key={region.region} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{region.region}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getSeverityColor(region.severity)}>{region.severity}</Badge>
                    <span className="text-sm text-muted-foreground">{region.driftCount} issues</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recommendations</CardTitle>
                <CardDescription>Suggested actions to improve drift management</CardDescription>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" disabled={selectedRecommendations.length === 0}>
                    <Play className="h-4 w-4 mr-2" />
                    Apply Fix ({selectedRecommendations.length})
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Apply Recommendations</DialogTitle>
                    <DialogDescription>
                      Apply selected recommendations to improve your drift management
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div>
                      <Label>Selected recommendations:</Label>
                      <div className="mt-2 space-y-2">
                        {recommendations
                          .filter((rec) => selectedRecommendations.includes(rec.id))
                          .map((rec) => (
                            <div key={rec.id} className="p-3 border rounded">
                              <div className="font-medium">{rec.title}</div>
                              <div className="text-sm text-muted-foreground">{rec.description}</div>
                              <div className="flex gap-2 mt-2">
                                <Badge variant="outline">{rec.priority} Priority</Badge>
                                <Badge variant="outline">{rec.estimatedTime}</Badge>
                                <Badge variant="outline">{rec.resources} resources</Badge>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-blue-800">Ready to Apply</h4>
                          <p className="text-sm text-blue-700">
                            {selectedRecommendations.length} recommendations will be applied to improve your drift
                            management.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline">Cancel</Button>
                    <Button onClick={handleApplyRecommendations}>
                      <Play className="h-4 w-4 mr-2" />
                      Apply Recommendations
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendations.map((rec) => (
                <div key={rec.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <Checkbox
                    checked={selectedRecommendations.includes(rec.id)}
                    onCheckedChange={() => handleSelectRecommendation(rec.id)}
                  />
                  <div className="flex-1">
                    <div className="font-medium">{rec.title}</div>
                    <div className="text-sm text-muted-foreground mb-2">{rec.description}</div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">
                        {rec.priority} Priority
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {rec.estimatedTime}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {rec.resources} resources
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
