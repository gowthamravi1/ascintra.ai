"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { FileText, Download, Eye, Calendar, Search, Shield, TrendingUp } from "lucide-react"

const auditReports = [
  {
    id: "AUD-2024-001",
    title: "SOC 2 Type II - Recovery Controls",
    type: "SOC 2",
    status: "completed",
    date: "2024-01-15",
    auditor: "Ernst & Young",
    scope: "Recovery Operations",
    findings: 2,
    recommendations: 5,
    compliance: 94,
  },
  {
    id: "AUD-2024-002",
    title: "DORA Section 9 - ICT Risk Management",
    type: "DORA",
    status: "in-progress",
    date: "2024-01-20",
    auditor: "KPMG",
    scope: "ICT Risk Framework",
    findings: 0,
    recommendations: 3,
    compliance: 87,
  },
  {
    id: "AUD-2024-003",
    title: "ISO 27001 - Business Continuity",
    type: "ISO 27001",
    status: "scheduled",
    date: "2024-02-01",
    auditor: "Deloitte",
    scope: "Business Continuity Management",
    findings: null,
    recommendations: null,
    compliance: null,
  },
  {
    id: "AUD-2023-012",
    title: "DORA Section 10 - Operational Resilience",
    type: "DORA",
    status: "completed",
    date: "2023-12-10",
    auditor: "PwC",
    scope: "Operational Resilience Testing",
    findings: 1,
    recommendations: 4,
    compliance: 91,
  },
]

const complianceMetrics = [
  { framework: "SOC 2 Type II", score: 94, trend: "+2%", status: "excellent" },
  { framework: "DORA Sections 9-11", score: 89, trend: "+5%", status: "good" },
  { framework: "ISO 27001", score: 92, trend: "+1%", status: "excellent" },
  { framework: "NIST CSF", score: 87, trend: "+3%", status: "good" },
]

const auditFindings = [
  {
    id: "F-001",
    severity: "high",
    title: "Incomplete Recovery Time Documentation",
    description: "RTO/RPO documentation missing for 3 critical systems",
    framework: "SOC 2",
    status: "open",
    assignee: "John Smith",
    dueDate: "2024-02-15",
  },
  {
    id: "F-002",
    severity: "medium",
    title: "ICT Risk Assessment Frequency",
    description: "Risk assessments not conducted quarterly as required",
    framework: "DORA",
    status: "in-progress",
    assignee: "Sarah Johnson",
    dueDate: "2024-02-01",
  },
  {
    id: "F-003",
    severity: "low",
    title: "Training Record Gaps",
    description: "Some staff missing recent recovery training certification",
    framework: "ISO 27001",
    status: "resolved",
    assignee: "Mike Davis",
    dueDate: "2024-01-20",
  },
]

export default function ComplianceAuditPage() {
  const [selectedReport, setSelectedReport] = useState(null)
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterType, setFilterType] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: "default",
      "in-progress": "secondary",
      scheduled: "outline",
    }
    return <Badge variant={variants[status] || "outline"}>{status.replace("-", " ")}</Badge>
  }

  const getSeverityBadge = (severity: string) => {
    const variants = {
      high: "destructive",
      medium: "secondary",
      low: "outline",
    }
    return <Badge variant={variants[severity] || "outline"}>{severity}</Badge>
  }

  const getComplianceColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 80) return "text-yellow-600"
    return "text-red-600"
  }

  const filteredReports = auditReports.filter((report) => {
    const matchesStatus = filterStatus === "all" || report.status === filterStatus
    const matchesType = filterType === "all" || report.type === filterType
    const matchesSearch =
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.auditor.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesType && matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Audit Reports</h1>
          <p className="text-muted-foreground">Compliance audit reports and findings management</p>
        </div>
        <Button>
          <FileText className="mr-2 h-4 w-4" />
          Generate Report
        </Button>
      </div>

      {/* Compliance Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {complianceMetrics.map((metric) => (
          <Card key={metric.framework}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.framework}</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.score}%</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="mr-1 h-3 w-3" />
                {metric.trend} from last audit
              </div>
              <Progress value={metric.score} className="mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="reports" className="space-y-4">
        <TabsList>
          <TabsTrigger value="reports">Audit Reports</TabsTrigger>
          <TabsTrigger value="findings">Findings & Actions</TabsTrigger>
          <TabsTrigger value="schedule">Audit Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filter Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search reports..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="SOC 2">SOC 2</SelectItem>
                      <SelectItem value="DORA">DORA</SelectItem>
                      <SelectItem value="ISO 27001">ISO 27001</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reports Table */}
          <Card>
            <CardHeader>
              <CardTitle>Audit Reports</CardTitle>
              <CardDescription>Complete list of compliance audit reports and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Auditor</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Compliance</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.id}</TableCell>
                      <TableCell>{report.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{report.type}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(report.status)}</TableCell>
                      <TableCell>{report.auditor}</TableCell>
                      <TableCell>{report.date}</TableCell>
                      <TableCell>
                        {report.compliance && (
                          <span className={getComplianceColor(report.compliance)}>{report.compliance}%</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>{report.title}</DialogTitle>
                                <DialogDescription>Audit report details and findings</DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Report ID</Label>
                                    <p className="text-sm">{report.id}</p>
                                  </div>
                                  <div>
                                    <Label>Auditor</Label>
                                    <p className="text-sm">{report.auditor}</p>
                                  </div>
                                  <div>
                                    <Label>Scope</Label>
                                    <p className="text-sm">{report.scope}</p>
                                  </div>
                                  <div>
                                    <Label>Date</Label>
                                    <p className="text-sm">{report.date}</p>
                                  </div>
                                </div>
                                {report.findings !== null && (
                                  <div className="grid grid-cols-3 gap-4">
                                    <div>
                                      <Label>Findings</Label>
                                      <p className="text-2xl font-bold text-red-600">{report.findings}</p>
                                    </div>
                                    <div>
                                      <Label>Recommendations</Label>
                                      <p className="text-2xl font-bold text-yellow-600">{report.recommendations}</p>
                                    </div>
                                    <div>
                                      <Label>Compliance Score</Label>
                                      <p className={`text-2xl font-bold ${getComplianceColor(report.compliance)}`}>
                                        {report.compliance}%
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                          {report.status === "completed" && (
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="findings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit Findings & Remediation Actions</CardTitle>
              <CardDescription>Track and manage audit findings and their remediation status</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Finding ID</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Framework</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assignee</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditFindings.map((finding) => (
                    <TableRow key={finding.id}>
                      <TableCell className="font-medium">{finding.id}</TableCell>
                      <TableCell>{getSeverityBadge(finding.severity)}</TableCell>
                      <TableCell>{finding.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{finding.framework}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={finding.status === "resolved" ? "default" : "secondary"}>
                          {finding.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{finding.assignee}</TableCell>
                      <TableCell>{finding.dueDate}</TableCell>
                      <TableCell>
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
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Audit Schedule</CardTitle>
              <CardDescription>Planned compliance audits and assessment timeline</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <Calendar className="h-8 w-8 text-blue-600" />
                  <div className="flex-1">
                    <h3 className="font-semibold">SOC 2 Type II Annual Review</h3>
                    <p className="text-sm text-muted-foreground">Comprehensive security controls audit</p>
                    <p className="text-sm">Scheduled: March 15, 2024 | Auditor: Ernst & Young</p>
                  </div>
                  <Badge>Upcoming</Badge>
                </div>
                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <Calendar className="h-8 w-8 text-green-600" />
                  <div className="flex-1">
                    <h3 className="font-semibold">DORA Section 11 - Testing</h3>
                    <p className="text-sm text-muted-foreground">Operational resilience testing assessment</p>
                    <p className="text-sm">Scheduled: April 1, 2024 | Auditor: KPMG</p>
                  </div>
                  <Badge>Planned</Badge>
                </div>
                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <Calendar className="h-8 w-8 text-purple-600" />
                  <div className="flex-1">
                    <h3 className="font-semibold">ISO 27001 Surveillance Audit</h3>
                    <p className="text-sm text-muted-foreground">
                      Annual surveillance audit for certification maintenance
                    </p>
                    <p className="text-sm">Scheduled: May 20, 2024 | Auditor: BSI</p>
                  </div>
                  <Badge variant="outline">Scheduled</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
