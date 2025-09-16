"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle, AlertTriangle, Clock, Play, Eye } from "lucide-react"

const scanHistory = [
  {
    id: "scan-001",
    account: "Production (123456789012)",
    startTime: "2024-01-08 14:30:00",
    duration: "4m 32s",
    status: "completed",
    resourcesScanned: 1247,
    newFindings: 5,
    resolvedFindings: 2,
  },
  {
    id: "scan-002",
    account: "Staging (987654321098)",
    startTime: "2024-01-08 10:15:00",
    duration: "2m 18s",
    status: "completed",
    resourcesScanned: 456,
    newFindings: 1,
    resolvedFindings: 0,
  },
  {
    id: "scan-003",
    account: "Development (456789012345)",
    startTime: "2024-01-08 16:45:00",
    duration: "1m 45s",
    status: "running",
    resourcesScanned: 234,
    newFindings: 0,
    resolvedFindings: 0,
  },
  {
    id: "scan-004",
    account: "Production (123456789012)",
    startTime: "2024-01-07 14:30:00",
    duration: "4m 28s",
    status: "completed",
    resourcesScanned: 1245,
    newFindings: 8,
    resolvedFindings: 3,
  },
  {
    id: "scan-005",
    account: "Production (123456789012)",
    startTime: "2024-01-06 09:20:00",
    duration: "Failed after 2m 15s",
    status: "failed",
    resourcesScanned: 0,
    newFindings: 0,
    resolvedFindings: 0,
  },
]

export default function ScanHistoryPage() {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-success" />
      case "running":
        return <Clock className="h-4 w-4 text-warning" />
      case "failed":
        return <AlertTriangle className="h-4 w-4 text-critical" />
      default:
        return null
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "success"
      case "running":
        return "warning"
      case "failed":
        return "critical"
      default:
        return "secondary"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Scan History</h1>
          <p className="text-muted-foreground">View and manage your security scan history</p>
        </div>
        <Button className="gap-2">
          <Play className="h-4 w-4" />
          Run New Scan
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Successful</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">44</div>
            <p className="text-xs text-muted-foreground">93.6% success rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-critical">3</div>
            <p className="text-xs text-muted-foreground">Configuration issues</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3m 42s</div>
            <p className="text-xs text-muted-foreground">Per scan</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Scans</CardTitle>
          <CardDescription>History of security scans across all connected accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Scan ID</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Resources</TableHead>
                <TableHead>Findings</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scanHistory.map((scan) => (
                <TableRow key={scan.id}>
                  <TableCell className="font-mono text-sm">{scan.id}</TableCell>
                  <TableCell>{scan.account}</TableCell>
                  <TableCell>{scan.startTime}</TableCell>
                  <TableCell>{scan.duration}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(scan.status)}
                      <Badge variant={getStatusVariant(scan.status)}>{scan.status}</Badge>
                    </div>
                  </TableCell>
                  <TableCell>{scan.resourcesScanned.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="text-critical">+{scan.newFindings} new</div>
                      <div className="text-success">-{scan.resolvedFindings} resolved</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
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
