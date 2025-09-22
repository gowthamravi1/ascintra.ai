"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Search, RefreshCw, Clock, CheckCircle, XCircle, AlertTriangle, Play, Eye, Calendar, Database, Shield, Activity, TrendingUp, TrendingDown, Minus } from "lucide-react"

type Findings = { critical: number; high: number; medium: number; low: number }

type Scan = {
  id: string
  accountName: string
  accountId: string
  type: "full" | "incremental" | "compliance" | "backup-validation"
  status: "completed" | "running" | "failed" | "cancelled"
  startTime: string
  endTime?: string
  durationSec: number
  duration: string
  resourcesScanned: number
  backupResourcesFound: number
  findings: Findings
  recoveryScore: number
  backupCoverage: number
  triggeredBy: "scheduled" | "manual" | "api" | "webhook"
  region: string
  progress?: number
  attachmentUrl?: string
}

const toDuration = (seconds: number) => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}h ${m}m ${s}s`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

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
  const [selectedScan, setSelectedScan] = useState<Scan | null>(null)
  const [scans, setScans] = useState<Scan[]>([])
  const [metrics, setMetrics] = useState({ total: 0, successRate: 0, avgDuration: 0, resources: 0 })
  const [newScanOpen, setNewScanOpen] = useState(false)
  const [newScanAccountId, setNewScanAccountId] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/tenant/discovery/history", { cache: "no-store" })
        if (!res.ok) return
        const data = await res.json()
        const items = Array.isArray(data?.scans) ? data.scans : []
        const mapped: Scan[] = items.map((s: any) => ({
          id: String(s.id),
          accountName: s.account_name,
          accountId: s.account_id,
          type: s.type,
          status: s.status,
          startTime: s.start_time,
          endTime: s.end_time || undefined,
          durationSec: Number(s.duration_seconds ?? 0),
          duration: toDuration(Number(s.duration_seconds ?? 0)),
          resourcesScanned: Number(s.resources_scanned ?? 0),
          backupResourcesFound: Number(s.resources_with_backups ?? 0),
          findings: s.findings || { critical: 0, high: 0, medium: 0, low: 0 },
          recoveryScore: Number(s.recovery_score ?? 0),
          backupCoverage: Number(s.backup_coverage ?? 0),
          triggeredBy: s.triggered_by,
          region: s.region,
          progress: s.progress ?? undefined,
          attachmentUrl: s.attachment_url || undefined,
        }))
        setScans(mapped)
        const sum = data?.summary || {}
        setMetrics({
          total: Number(sum.total_scans ?? mapped.length),
          successRate: Number(sum.success_rate ?? 0),
          avgDuration: Number(sum.avg_duration_seconds ?? 0),
          resources: Number(sum.resources_scanned ?? 0),
        })
      } catch {}
    }
    load()
  }, [])

  const filteredScans = scans.filter((scan) => {
    const matchesSearch =
      scan.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scan.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scan.accountId.includes(searchTerm)

    const matchesStatus = statusFilter === "all" || scan.status === statusFilter
    const matchesType = typeFilter === "all" || scan.type === typeFilter
    const matchesAccount = accountFilter === "all" || scan.accountName === accountFilter

    return matchesSearch && matchesStatus && matchesType && matchesAccount
  })

  const uniqueAccounts = Array.from(new Set(scans.map((scan) => scan.accountName)))
  const accountOptions = Array.from(
    new Map(scans.map((s) => [s.accountId, { id: s.accountId, name: s.accountName }])).values()
  )
  const avgMinutes = metrics.avgDuration / 60
  const successRate = metrics.successRate
  const totalResourcesScanned = metrics.resources

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Discovery History</h1>
          <p className="text-gray-600 dark:text-gray-400">View and analyze your AWS resource discovery and backup validation history</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
          <Dialog open={newScanOpen} onOpenChange={setNewScanOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Play className="h-4 w-4 mr-2" /> New Scan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Start New Scan</DialogTitle>
                <DialogDescription>Select an account to scan now</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Account</label>
                  <Select value={newScanAccountId ?? undefined} onValueChange={(v) => setNewScanAccountId(v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accountOptions.map((opt) => (
                        <SelectItem key={opt.id} value={opt.id}>{opt.name || opt.id}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setNewScanOpen(false)}>Cancel</Button>
                  <Button
                    onClick={async () => {
                      if (!newScanAccountId) return
                      try {
                        await fetch(`/api/tenant/discovery/history/scan/${newScanAccountId}`, { method: 'POST' })
                        setNewScanOpen(false)
                        location.reload()
                      } catch {}
                    }}
                    disabled={!newScanAccountId}
                  >
                    Start Scan
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> +12 this week
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
              <TrendingUp className="h-3 w-3" /> +2.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(avgMinutes)}m</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingDown className="h-3 w-3" /> -5m from last week
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" /> Discovery Scan History
          </CardTitle>
          <CardDescription>View and filter your resource discovery and backup validation history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by account, scan ID, or account ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8" />
              </div>
            </div>
            <Select value={accountFilter} onValueChange={setAccountFilter}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="Filter by account" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Accounts</SelectItem>
                {uniqueAccounts.map((account) => (
                  <SelectItem key={account} value={account}>{account}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter by status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="running">Running</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter by type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="full">Full Scan</SelectItem>
                <SelectItem value="incremental">Incremental</SelectItem>
                <SelectItem value="compliance">Compliance</SelectItem>
                <SelectItem value="backup-validation">Backup Validation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border overflow-hidden">
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
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredScans.map((scan) => (
                  <TableRow key={scan.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{scan.id}</div>
                        <div className="text-xs text-muted-foreground">Started: {scan.startTime}</div>
                        {scan.progress !== undefined && (
                          <div className="text-[10px] text-blue-600 mt-1">{scan.progress}% complete</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{scan.accountName}</div>
                      <div className="text-xs text-muted-foreground">{scan.accountId} • {scan.region}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">{getTypeIcon(scan.type)} {getTypeBadge(scan.type)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">{getStatusIcon(scan.status)} {getStatusBadge(scan.status)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{scan.duration}</div>
                      <div className="text-xs text-muted-foreground">{scan.triggeredBy}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{scan.resourcesScanned.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">{scan.backupResourcesFound} with backups</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{scan.recoveryScore}</div>
                      <Progress value={scan.recoveryScore} className="h-2 mt-1" />
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{scan.backupCoverage.toFixed(1)}%</div>
                      <Progress value={scan.backupCoverage} className="h-2 mt-1" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={async () => {
                              try {
                                const res = await fetch(`/api/tenant/discovery/history/${scan.id}`, { cache: "no-store" })
                                if (res.ok) {
                                  const s = await res.json()
                                  const mapped: Scan = {
                                    id: s.id,
                                    accountName: s.account_name,
                                    accountId: s.account_id,
                                    type: s.type,
                                    status: s.status,
                                    startTime: s.start_time,
                                    endTime: s.end_time || undefined,
                                    durationSec: Number(s.duration_seconds ?? 0),
                                    duration: toDuration(Number(s.duration_seconds ?? 0)),
                                    resourcesScanned: Number(s.resources_scanned ?? 0),
                                    backupResourcesFound: Number(s.resources_with_backups ?? 0),
                                    findings: s.findings || { critical: 0, high: 0, medium: 0, low: 0 },
                                    recoveryScore: Number(s.recovery_score ?? 0),
                                    backupCoverage: Number(s.backup_coverage ?? 0),
                                    triggeredBy: s.triggered_by,
                                    region: s.region,
                                    progress: s.progress ?? undefined,
                                    attachmentUrl: s.attachment_url || undefined,
                                  }
                                  setSelectedScan(mapped)
                                } else {
                                  setSelectedScan(scan)
                                }
                              } catch {
                                setSelectedScan(scan)
                              }
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          {selectedScan && (
                            <div className="space-y-6">
                              <DialogHeader>
                                <DialogTitle>Scan Details: {selectedScan.id}</DialogTitle>
                                <DialogDescription>Detailed information about the discovery scan</DialogDescription>
                              </DialogHeader>
                              {selectedScan.attachmentUrl && (
                                <div>
                                  <img src={selectedScan.attachmentUrl} alt="Scan attachment" className="rounded border" />
                                </div>
                              )}
                              <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                  <h4 className="font-medium">Scan Information</h4>
                                  <div className="space-y-1 text-sm">
                                    <div className="flex justify-between"><span className="text-muted-foreground">Scan ID:</span><span>{selectedScan.id}</span></div>
                                    <div className="flex justify-between"><span className="text-muted-foreground">Type:</span><span>{selectedScan.type}</span></div>
                                    <div className="flex justify-between"><span className="text-muted-foreground">Status:</span><span>{selectedScan.status}</span></div>
                                    <div className="flex justify-between"><span className="text-muted-foreground">Duration:</span><span>{selectedScan.duration}</span></div>
                                    <div className="flex justify-between"><span className="text-muted-foreground">Triggered By:</span><span>{selectedScan.triggeredBy}</span></div>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <h4 className="font-medium">Account Information</h4>
                                  <div className="space-y-1 text-sm">
                                    <div className="flex justify-between"><span className="text-muted-foreground">Account:</span><span>{selectedScan.accountName}</span></div>
                                    <div className="flex justify-between"><span className="text-muted-foreground">Account ID:</span><span>{selectedScan.accountId}</span></div>
                                    <div className="flex justify-between"><span className="text-muted-foreground">Region:</span><span>{selectedScan.region}</span></div>
                                  </div>
                                </div>
                              </div>
                              <div className="grid gap-4 md:grid-cols-3">
                                <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Resources Scanned</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{selectedScan.resourcesScanned.toLocaleString()}</div><div className="text-sm text-muted-foreground">{selectedScan.backupResourcesFound} with backups</div></CardContent></Card>
                                <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Recovery Score</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{selectedScan.recoveryScore}</div><Progress value={selectedScan.recoveryScore} className="h-2 mt-2" /></CardContent></Card>
                                <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Backup Coverage</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{selectedScan.backupCoverage.toFixed(1)}%</div><Progress value={selectedScan.backupCoverage} className="h-2 mt-2" /></CardContent></Card>
                              </div>
                              <div className="space-y-2">
                                <h4 className="font-medium">Recovery Findings</h4>
                                <div className="grid gap-2 md:grid-cols-4">
                                  <div className="flex items-center justify-between p-2 border rounded"><span className="text-sm">Critical</span><Badge variant="destructive">{selectedScan.findings.critical}</Badge></div>
                                  <div className="flex items-center justify-between p-2 border rounded"><span className="text-sm">High</span><Badge variant="warning">{selectedScan.findings.high}</Badge></div>
                                  <div className="flex items-center justify-between p-2 border rounded"><span className="text-sm">Medium</span><Badge variant="info">{selectedScan.findings.medium}</Badge></div>
                                  <div className="flex items-center justify-between p-2 border rounded"><span className="text-sm">Low</span><Badge variant="secondary">{selectedScan.findings.low}</Badge></div>
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
