"use client"
import { useState } from "react"
import { Shield, AlertTriangle, CheckCircle, TrendingUp, FileText, Target } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Clock, User, AlertCircle, CheckCircle2 } from "lucide-react"

export default function CISODashboard() {
  const [showSecurityReview, setShowSecurityReview] = useState(false)
  const [showAllIncidents, setShowAllIncidents] = useState(false)

  const securityTrendData = [
    { month: "Jan", critical: 12, high: 25, medium: 45, low: 18 },
    { month: "Feb", critical: 8, high: 22, medium: 42, low: 28 },
    { month: "Mar", critical: 5, high: 18, medium: 38, low: 39 },
    { month: "Apr", critical: 3, high: 15, medium: 35, low: 47 },
    { month: "May", critical: 2, high: 12, medium: 32, low: 54 },
    { month: "Jun", critical: 1, high: 8, medium: 28, low: 63 },
  ]

  const complianceFrameworks = [
    { name: "SOC 2 Type II", score: 94, status: "compliant", lastAudit: "2024-01-15" },
    { name: "ISO 27001", score: 91, status: "compliant", lastAudit: "2024-02-20" },
    { name: "GDPR", score: 88, status: "compliant", lastAudit: "2024-01-30" },
    { name: "HIPAA", score: 96, status: "compliant", lastAudit: "2024-02-10" },
    { name: "PCI DSS", score: 89, status: "compliant", lastAudit: "2024-01-25" },
    { name: "NIST CSF", score: 92, status: "compliant", lastAudit: "2024-02-05" },
  ]

  const businessContinuityMetrics = [
    { service: "Customer Portal", rto: "< 1 hour", rpo: "< 15 min", status: "green" },
    { service: "Payment Processing", rto: "< 30 min", rpo: "< 5 min", status: "green" },
    { service: "Internal Systems", rto: "< 4 hours", rpo: "< 1 hour", status: "yellow" },
    { service: "Analytics Platform", rto: "< 8 hours", rpo: "< 4 hours", status: "green" },
    { service: "Backup Systems", rto: "< 2 hours", rpo: "< 30 min", status: "red" },
  ]

  const securityIncidents = [
    {
      id: 1,
      title: "Suspicious Login Activity",
      severity: "medium",
      status: "investigating",
      time: "2 hours ago",
      description: "Multiple failed login attempts from unusual location",
    },
    {
      id: 2,
      title: "Backup Encryption Key Rotation",
      severity: "low",
      status: "completed",
      time: "1 day ago",
      description: "Scheduled encryption key rotation completed successfully",
    },
    {
      id: 3,
      title: "Vulnerability Scan Alert",
      severity: "high",
      status: "remediated",
      time: "3 days ago",
      description: "Critical vulnerability detected and patched in web application",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">CISO Dashboard</h1>
          <p className="text-slate-600 mt-1">Security posture and compliance overview</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Dialog open={showSecurityReview} onOpenChange={setShowSecurityReview}>
            <DialogTrigger asChild>
              <Button>
                <Shield className="h-4 w-4 mr-2" />
                Security Review
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  Security Review Dashboard
                </DialogTitle>
                <DialogDescription>Comprehensive security assessment and review management</DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Review Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-800">Completed Reviews</p>
                          <p className="text-2xl font-bold text-green-900">24</p>
                        </div>
                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-yellow-50 border-yellow-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-yellow-800">Pending Reviews</p>
                          <p className="text-2xl font-bold text-yellow-900">8</p>
                        </div>
                        <Clock className="h-8 w-8 text-yellow-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-red-50 border-red-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-red-800">Overdue Reviews</p>
                          <p className="text-2xl font-bold text-red-900">3</p>
                        </div>
                        <AlertCircle className="h-8 w-8 text-red-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Create New Review */}
                <Card>
                  <CardHeader>
                    <CardTitle>Create Security Review</CardTitle>
                    <CardDescription>Schedule a new security assessment</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Review Type</label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select review type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="quarterly">Quarterly Security Review</SelectItem>
                            <SelectItem value="incident">Incident Response Review</SelectItem>
                            <SelectItem value="compliance">Compliance Audit</SelectItem>
                            <SelectItem value="vulnerability">Vulnerability Assessment</SelectItem>
                            <SelectItem value="policy">Policy Review</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Priority</label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="critical">Critical</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Review Scope</label>
                      <Textarea
                        placeholder="Describe the scope and objectives of this security review..."
                        className="min-h-[100px]"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Assigned Reviewer</label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select reviewer" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="john.doe">John Doe (Senior Security Analyst)</SelectItem>
                            <SelectItem value="jane.smith">Jane Smith (Security Manager)</SelectItem>
                            <SelectItem value="mike.wilson">Mike Wilson (Compliance Officer)</SelectItem>
                            <SelectItem value="sarah.johnson">Sarah Johnson (Risk Analyst)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Due Date</label>
                        <input
                          type="date"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowSecurityReview(false)}>
                        Cancel
                      </Button>
                      <Button>Create Review</Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Reviews */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Security Reviews</CardTitle>
                    <CardDescription>Latest security assessments and their status</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Review Type</TableHead>
                          <TableHead>Reviewer</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Due Date</TableHead>
                          <TableHead>Priority</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Quarterly Security Review</TableCell>
                          <TableCell>John Doe</TableCell>
                          <TableCell>
                            <Badge variant="default">In Progress</Badge>
                          </TableCell>
                          <TableCell>2024-02-15</TableCell>
                          <TableCell>
                            <Badge variant="secondary">High</Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Incident Response Review</TableCell>
                          <TableCell>Jane Smith</TableCell>
                          <TableCell>
                            <Badge variant="default">Completed</Badge>
                          </TableCell>
                          <TableCell>2024-01-30</TableCell>
                          <TableCell>
                            <Badge variant="destructive">Critical</Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Compliance Audit</TableCell>
                          <TableCell>Mike Wilson</TableCell>
                          <TableCell>
                            <Badge variant="secondary">Pending</Badge>
                          </TableCell>
                          <TableCell>2024-02-20</TableCell>
                          <TableCell>
                            <Badge variant="secondary">Medium</Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Key Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white/60 backdrop-blur-sm border-white/20 hover:bg-white/80 transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Security Score</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">94/100</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +2 from last month
            </div>
            <Progress value={94} className="mt-3" />
          </CardContent>
        </Card>

        <Card className="bg-white/60 backdrop-blur-sm border-white/20 hover:bg-white/80 transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Active Incidents</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">3</div>
            <div className="flex items-center text-xs text-red-600 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +1 from yesterday
            </div>
            <div className="flex space-x-1 mt-3">
              <Badge variant="destructive" className="text-xs">
                1 High
              </Badge>
              <Badge variant="secondary" className="text-xs">
                2 Medium
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/60 backdrop-blur-sm border-white/20 hover:bg-white/80 transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Compliance Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">98.5%</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +0.5% from last quarter
            </div>
            <Progress value={98.5} className="mt-3" />
          </CardContent>
        </Card>

        <Card className="bg-white/60 backdrop-blur-sm border-white/20 hover:bg-white/80 transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Recovery Readiness</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">91%</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +3% from last month
            </div>
            <Progress value={91} className="mt-3" />
          </CardContent>
        </Card>
      </div>

      {/* Security Risk Trend */}
      <Card className="bg-white/60 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-slate-900">Security Risk Trend</CardTitle>
          <CardDescription>Risk levels over the past 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={securityTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Area type="monotone" dataKey="critical" stackId="1" stroke="#dc2626" fill="#dc2626" />
              <Area type="monotone" dataKey="high" stackId="1" stroke="#ea580c" fill="#ea580c" />
              <Area type="monotone" dataKey="medium" stackId="1" stroke="#d97706" fill="#d97706" />
              <Area type="monotone" dataKey="low" stackId="1" stroke="#65a30d" fill="#65a30d" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Compliance and Business Continuity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compliance Framework Status */}
        <Card className="bg-white/60 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-slate-900">Compliance Framework Status</CardTitle>
            <CardDescription>Current compliance scores across frameworks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {complianceFrameworks.map((framework) => (
                <div key={framework.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">{framework.name}</span>
                    <div className="flex items-center space-x-2">
                      <Badge variant="default" className="text-xs">
                        {framework.score}%
                      </Badge>
                      <Badge variant={framework.status === "compliant" ? "default" : "destructive"} className="text-xs">
                        {framework.status}
                      </Badge>
                    </div>
                  </div>
                  <Progress value={framework.score} className="h-2" />
                  <div className="text-xs text-slate-500">
                    Last audit: {new Date(framework.lastAudit).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Business Continuity & Recovery */}
        <Card className="bg-white/60 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-slate-900">Business Continuity & Recovery</CardTitle>
            <CardDescription>RTO/RPO targets for critical services</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {businessContinuityMetrics.map((service, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/40">
                  <div className="flex-1">
                    <div className="font-medium text-slate-900">{service.service}</div>
                    <div className="text-sm text-slate-600">
                      RTO: {service.rto} | RPO: {service.rpo}
                    </div>
                  </div>
                  <div
                    className={`w-3 h-3 rounded-full ${
                      service.status === "green"
                        ? "bg-green-500"
                        : service.status === "yellow"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                    }`}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Security Incidents */}
      <Card className="bg-white/60 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-slate-900">Recent Security Incidents</CardTitle>
          <CardDescription>Latest security events and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {securityIncidents.map((incident) => (
              <div key={incident.id} className="flex items-start space-x-3 p-4 rounded-lg bg-white/40">
                <div
                  className={`w-2 h-2 rounded-full mt-2 ${
                    incident.severity === "high"
                      ? "bg-red-500"
                      : incident.severity === "medium"
                        ? "bg-orange-500"
                        : "bg-blue-500"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-900">{incident.title}</p>
                    <span className="text-xs text-slate-500">{incident.time}</span>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{incident.description}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge
                      variant={
                        incident.severity === "high"
                          ? "destructive"
                          : incident.severity === "medium"
                            ? "secondary"
                            : "default"
                      }
                      className="text-xs"
                    >
                      {incident.severity}
                    </Badge>
                    <Badge
                      variant={
                        incident.status === "investigating"
                          ? "secondary"
                          : incident.status === "completed"
                            ? "default"
                            : "default"
                      }
                      className="text-xs"
                    >
                      {incident.status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Drawer open={showAllIncidents} onOpenChange={setShowAllIncidents}>
            <DrawerTrigger asChild>
              <Button variant="outline" className="w-full mt-4 bg-transparent">
                View All Incidents
              </Button>
            </DrawerTrigger>
            <DrawerContent className="max-h-[80vh]">
              <DrawerHeader>
                <DrawerTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  Security Incidents Management
                </DrawerTitle>
                <DrawerDescription>Comprehensive view of all security incidents and their management</DrawerDescription>
              </DrawerHeader>

              <div className="px-4 pb-4 space-y-6 overflow-y-auto">
                {/* Incident Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="bg-red-50 border-red-200">
                    <CardContent className="p-3">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-900">15</p>
                        <p className="text-xs text-red-700">Critical</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-orange-50 border-orange-200">
                    <CardContent className="p-3">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-orange-900">28</p>
                        <p className="text-xs text-orange-700">High</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-yellow-50 border-yellow-200">
                    <CardContent className="p-3">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-yellow-900">42</p>
                        <p className="text-xs text-yellow-700">Medium</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-3">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-900">67</p>
                        <p className="text-xs text-blue-700">Low</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2">
                  <Select>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="investigating">Investigating</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Severity</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="malware">Malware</SelectItem>
                      <SelectItem value="phishing">Phishing</SelectItem>
                      <SelectItem value="data-breach">Data Breach</SelectItem>
                      <SelectItem value="unauthorized-access">Unauthorized Access</SelectItem>
                      <SelectItem value="ddos">DDoS Attack</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Detailed Incidents Table */}
                <Card>
                  <CardHeader>
                    <CardTitle>All Security Incidents</CardTitle>
                    <CardDescription>Complete list of security incidents with detailed information</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Severity</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Assigned To</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Last Updated</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-mono text-sm">INC-2024-001</TableCell>
                          <TableCell className="font-medium">Suspicious Login Activity</TableCell>
                          <TableCell>
                            <Badge variant="secondary">Medium</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="default">Investigating</Badge>
                          </TableCell>
                          <TableCell>Unauthorized Access</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              John Doe
                            </div>
                          </TableCell>
                          <TableCell>2024-01-20</TableCell>
                          <TableCell>2 hours ago</TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-mono text-sm">INC-2024-002</TableCell>
                          <TableCell className="font-medium">Malware Detection</TableCell>
                          <TableCell>
                            <Badge variant="destructive">Critical</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">Resolved</Badge>
                          </TableCell>
                          <TableCell>Malware</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              Jane Smith
                            </div>
                          </TableCell>
                          <TableCell>2024-01-19</TableCell>
                          <TableCell>1 day ago</TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-mono text-sm">INC-2024-003</TableCell>
                          <TableCell className="font-medium">Phishing Email Campaign</TableCell>
                          <TableCell>
                            <Badge variant="destructive">High</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="default">Open</Badge>
                          </TableCell>
                          <TableCell>Phishing</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              Mike Wilson
                            </div>
                          </TableCell>
                          <TableCell>2024-01-18</TableCell>
                          <TableCell>3 days ago</TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-mono text-sm">INC-2024-004</TableCell>
                          <TableCell className="font-medium">DDoS Attack Attempt</TableCell>
                          <TableCell>
                            <Badge variant="destructive">Critical</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">Mitigated</Badge>
                          </TableCell>
                          <TableCell>DDoS</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              Sarah Johnson
                            </div>
                          </TableCell>
                          <TableCell>2024-01-17</TableCell>
                          <TableCell>4 days ago</TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-mono text-sm">INC-2024-005</TableCell>
                          <TableCell className="font-medium">Data Exfiltration Attempt</TableCell>
                          <TableCell>
                            <Badge variant="destructive">Critical</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="default">Investigating</Badge>
                          </TableCell>
                          <TableCell>Data Breach</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              Alex Chen
                            </div>
                          </TableCell>
                          <TableCell>2024-01-16</TableCell>
                          <TableCell>5 days ago</TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Incident Response Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Average Response Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">23 minutes</div>
                      <div className="text-xs text-green-600 flex items-center mt-1">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        15% improvement
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Resolution Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">94.2%</div>
                      <div className="text-xs text-green-600 flex items-center mt-1">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        2.1% increase
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Open Incidents</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">8</div>
                      <div className="text-xs text-red-600 flex items-center mt-1">
                        <TrendingUp className="h-3 w-3 mr-1" />2 new today
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        </CardContent>
      </Card>
    </div>
  )
}
