"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  FileText,
  Plus,
  Search,
  Download,
  Edit,
  Eye,
  Users,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  BookOpen,
  Upload,
  Copy,
  RefreshCw,
} from "lucide-react"

export default function CompliancePoliciesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedPolicy, setSelectedPolicy] = useState<any>(null)
  const [policies, setPolicies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Calculate statistics from live data
  const totalPolicies = policies.length
  const activePolicies = policies.filter(policy => policy.enabled).length
  const pendingReview = policies.filter(policy => !policy.enabled).length
  const acknowledgmentRate = totalPolicies > 0 ? Math.round((activePolicies / totalPolicies) * 100) : 0

  // Load policies from API
  useEffect(() => {
    const loadPolicies = async () => {
      try {
        setLoading(true)
        const res = await fetch("/api/compliance/rules", { cache: "no-store" })
        if (!res.ok) return
        const data = await res.json()
        setPolicies(data || [])
      } catch (error) {
        console.error('Failed to load compliance rules:', error)
      } finally {
        setLoading(false)
      }
    }
    loadPolicies()
  }, [])

  // Mock data for policies (fallback)
  const mockPolicies = [
    {
      id: "POL-001",
      title: "Data Backup and Recovery Policy",
      category: "DORA",
      framework: "Digital Operational Resilience Act",
      status: "active",
      version: "2.1",
      lastUpdated: "2024-01-15",
      nextReview: "2024-07-15",
      owner: "Sarah Chen",
      approver: "Michael Rodriguez",
      acknowledgments: 45,
      totalAssigned: 52,
      description: "Defines requirements for data backup, recovery procedures, and business continuity planning.",
      riskLevel: "high",
    },
    {
      id: "POL-002",
      title: "Access Control and Authentication",
      category: "SOC2",
      framework: "SOC 2 Type II",
      status: "active",
      version: "1.8",
      lastUpdated: "2024-01-10",
      nextReview: "2024-04-10",
      owner: "David Kim",
      approver: "Sarah Chen",
      acknowledgments: 48,
      totalAssigned: 52,
      description: "Establishes access control requirements and multi-factor authentication protocols.",
      riskLevel: "high",
    },
    {
      id: "POL-003",
      title: "Incident Response Procedures",
      category: "ISO27001",
      framework: "ISO 27001:2022",
      status: "draft",
      version: "3.0",
      lastUpdated: "2024-01-20",
      nextReview: "2024-02-20",
      owner: "Lisa Wang",
      approver: "Michael Rodriguez",
      acknowledgments: 0,
      totalAssigned: 0,
      description: "Comprehensive incident response and recovery procedures for security events.",
      riskLevel: "critical",
    },
    {
      id: "POL-004",
      title: "Third-Party Risk Management",
      category: "NIST",
      framework: "NIST Cybersecurity Framework",
      status: "review",
      version: "1.5",
      lastUpdated: "2024-01-08",
      nextReview: "2024-02-08",
      owner: "James Thompson",
      approver: "Sarah Chen",
      acknowledgments: 32,
      totalAssigned: 52,
      description: "Guidelines for assessing and managing third-party vendor risks.",
      riskLevel: "medium",
    },
    {
      id: "POL-005",
      title: "Change Management Protocol",
      category: "DORA",
      framework: "Digital Operational Resilience Act",
      status: "active",
      version: "2.3",
      lastUpdated: "2024-01-12",
      nextReview: "2024-06-12",
      owner: "Emily Davis",
      approver: "Michael Rodriguez",
      acknowledgments: 50,
      totalAssigned: 52,
      description: "Procedures for managing changes to critical systems and infrastructure.",
      riskLevel: "medium",
    },
  ]

  const policyTemplates = [
    { id: "TPL-001", name: "Data Protection Policy", framework: "GDPR", category: "Privacy" },
    { id: "TPL-002", name: "Business Continuity Plan", framework: "DORA", category: "Operational" },
    { id: "TPL-003", name: "Information Security Policy", framework: "ISO 27001", category: "Security" },
    { id: "TPL-004", name: "Risk Management Framework", framework: "NIST", category: "Risk" },
  ]

  const filteredPolicies = policies.filter((policy) => {
    const matchesSearch =
      policy.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.rule_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.category?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || policy.category === selectedCategory
    const matchesStatus = selectedStatus === "all" || (selectedStatus === "active" ? policy.enabled : !policy.enabled)
    return matchesSearch && matchesCategory && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      draft: { color: "bg-gray-100 text-gray-800", icon: Edit },
      review: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      archived: { color: "bg-red-100 text-red-800", icon: AlertCircle },
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
    const Icon = config.icon
    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getRiskBadge = (severity: string) => {
    const severityConfig = {
      critical: "bg-red-100 text-red-800",
      high: "bg-orange-100 text-orange-800",
      medium: "bg-yellow-100 text-yellow-800",
      low: "bg-green-100 text-green-800",
    }
    return (
      <Badge className={severityConfig[severity as keyof typeof severityConfig] || severityConfig.medium}>
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </Badge>
    )
  }

  const getAcknowledgmentProgress = (acknowledged: number, total: number) => {
    return total > 0 ? Math.round((acknowledged / total) * 100) : 0
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading compliance policies...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Policy Management</h1>
          <p className="text-muted-foreground">Manage compliance policies, templates, and acknowledgments</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Policy
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Policy</DialogTitle>
                <DialogDescription>Create a new compliance policy from scratch or use a template</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="policy-title">Policy Title</Label>
                    <Input id="policy-title" placeholder="Enter policy title" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="policy-category">Framework</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select framework" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DORA">DORA</SelectItem>
                        <SelectItem value="SOC2">SOC 2 Type II</SelectItem>
                        <SelectItem value="ISO27001">ISO 27001</SelectItem>
                        <SelectItem value="NIST">NIST CSF</SelectItem>
                        <SelectItem value="GDPR">GDPR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="policy-owner">Policy Owner</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select owner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sarah">Sarah Chen</SelectItem>
                        <SelectItem value="michael">Michael Rodriguez</SelectItem>
                        <SelectItem value="david">David Kim</SelectItem>
                        <SelectItem value="lisa">Lisa Wang</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="risk-level">Risk Level</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select risk level" />
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
                  <Label htmlFor="policy-description">Description</Label>
                  <Textarea id="policy-description" placeholder="Enter policy description" rows={3} />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="use-template" />
                  <Label htmlFor="use-template">Use existing template</Label>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setIsCreateDialogOpen(false)}>Create Policy</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Policies</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPolicies}</div>
            <p className="text-xs text-muted-foreground">Compliance rules configured</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Policies</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePolicies}</div>
            <p className="text-xs text-muted-foreground">{totalPolicies > 0 ? Math.round((activePolicies / totalPolicies) * 100) : 0}% of total policies</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingReview}</div>
            <p className="text-xs text-muted-foreground">Disabled policies</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Acknowledgment Rate</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{acknowledgmentRate}%</div>
            <p className="text-xs text-muted-foreground">Active compliance rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="policies" className="space-y-4">
        <TabsList>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="acknowledgments">Acknowledgments</TabsTrigger>
        </TabsList>

        <TabsContent value="policies" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Policy Library</CardTitle>
              <CardDescription>Manage and track all compliance policies across frameworks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search policies..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Framework" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Frameworks</SelectItem>
                    <SelectItem value="DORA">DORA</SelectItem>
                    <SelectItem value="SOC2">SOC 2</SelectItem>
                    <SelectItem value="ISO27001">ISO 27001</SelectItem>
                    <SelectItem value="NIST">NIST CSF</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Policies Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Policy</TableHead>
                      <TableHead>Framework</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Risk Level</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Acknowledgments</TableHead>
                      <TableHead>Next Review</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPolicies.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12">
                          <div className="flex flex-col items-center space-y-4">
                            <FileText className="h-12 w-12 text-gray-400" />
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">No Compliance Rules Found</h3>
                              <p className="text-sm text-gray-500 mt-1">
                                {policies.length === 0 
                                  ? "No compliance rules have been configured yet."
                                  : "No rules match your current filters."
                                }
                              </p>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPolicies.map((policy) => (
                      <TableRow key={policy.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{policy.description}</div>
                            <div className="text-sm text-muted-foreground">
                              {policy.rule_id} • {policy.resource_type}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{policy.category}</Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(policy.enabled ? 'active' : 'inactive')}</TableCell>
                        <TableCell>{getRiskBadge(policy.severity)}</TableCell>
                        <TableCell>System</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm">
                              N/A
                            </div>
                            <Progress
                              value={0}
                              className="h-2"
                            />
                          </div>
                        </TableCell>
                        <TableCell>{policy.nextReview}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Policy Templates</CardTitle>
              <CardDescription>Pre-built policy templates for common compliance frameworks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {policyTemplates.map((template) => (
                  <Card key={template.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <BookOpen className="w-8 h-8 text-blue-600" />
                        <Badge variant="outline">{template.framework}</Badge>
                      </div>
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <CardDescription>
                        {template.category} • Template ID: {template.id}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1">
                          <Copy className="w-4 h-4 mr-2" />
                          Use Template
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="acknowledgments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Policy Acknowledgments</CardTitle>
              <CardDescription>Track policy acknowledgments and training completion</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {policies
                  .filter((p) => p.status === "active")
                  .map((policy) => (
                    <div key={policy.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-medium">{policy.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {policy.id} • {policy.framework}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {policy.acknowledgments}/{policy.totalAssigned} acknowledged
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {getAcknowledgmentProgress(policy.acknowledgments, policy.totalAssigned)}% complete
                          </div>
                        </div>
                      </div>
                      <Progress
                        value={getAcknowledgmentProgress(policy.acknowledgments, policy.totalAssigned)}
                        className="mb-3"
                      />
                      <div className="flex justify-between items-center">
                        <div className="flex gap-2">
                          {getRiskBadge(policy.riskLevel)}
                          <Badge variant="outline">Due: {policy.nextReview}</Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Users className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                          <Button variant="outline" size="sm">
                            <Calendar className="w-4 h-4 mr-2" />
                            Send Reminder
                          </Button>
                        </div>
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
