"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import {
  Shield,
  Plus,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Copy,
  Play,
  Pause,
  Download,
  Upload,
  BarChart3,
  TrendingUp,
  Activity,
} from "lucide-react"

interface DriftPolicy {
  id: string
  name: string
  description: string
  status: "active" | "inactive" | "draft"
  severity: "critical" | "high" | "medium" | "low"
  scope: string[]
  conditions: PolicyCondition[]
  actions: PolicyAction[]
  schedule: PolicySchedule
  notifications: PolicyNotification[]
  createdBy: string
  createdAt: string
  lastModified: string
  executionCount: number
  successRate: number
  lastExecution: string
}

interface PolicyCondition {
  id: string
  type: "configuration_change" | "threshold_breach" | "pattern_match" | "time_based"
  field: string
  operator: "equals" | "not_equals" | "contains" | "greater_than" | "less_than" | "regex"
  value: string
  enabled: boolean
}

interface PolicyAction {
  id: string
  type: "auto_remediate" | "create_ticket" | "send_notification" | "run_script" | "quarantine"
  config: Record<string, any>
  enabled: boolean
  order: number
}

interface PolicySchedule {
  enabled: boolean
  frequency: "continuous" | "hourly" | "daily" | "weekly" | "monthly"
  time?: string
  days?: string[]
  timezone: string
}

interface PolicyNotification {
  id: string
  type: "email" | "slack" | "webhook" | "sms"
  recipients: string[]
  template: string
  enabled: boolean
}

export default function DriftPoliciesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [severityFilter, setSeverityFilter] = useState<string>("all")
  const [selectedPolicies, setSelectedPolicies] = useState<string[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedPolicy, setSelectedPolicy] = useState<DriftPolicy | null>(null)
  const [activeTab, setActiveTab] = useState("policies")

  // Mock data
  const policies: DriftPolicy[] = [
    {
      id: "pol-001",
      name: "Critical Infrastructure Drift",
      description: "Monitor and auto-remediate critical infrastructure configuration changes",
      status: "active",
      severity: "critical",
      scope: ["production", "database", "load-balancer"],
      conditions: [
        {
          id: "cond-001",
          type: "configuration_change",
          field: "security_group_rules",
          operator: "not_equals",
          value: "expected_baseline",
          enabled: true,
        },
      ],
      actions: [
        {
          id: "act-001",
          type: "auto_remediate",
          config: { rollback: true, backup: true },
          enabled: true,
          order: 1,
        },
      ],
      schedule: {
        enabled: true,
        frequency: "continuous",
        timezone: "UTC",
      },
      notifications: [
        {
          id: "not-001",
          type: "email",
          recipients: ["admin@company.com"],
          template: "critical_drift_alert",
          enabled: true,
        },
      ],
      createdBy: "John Doe",
      createdAt: "2024-01-15T10:00:00Z",
      lastModified: "2024-01-20T14:30:00Z",
      executionCount: 156,
      successRate: 98.7,
      lastExecution: "2024-01-20T16:45:00Z",
    },
    {
      id: "pol-002",
      name: "Backup Configuration Compliance",
      description: "Ensure backup configurations meet compliance requirements",
      status: "active",
      severity: "high",
      scope: ["backup-systems", "storage"],
      conditions: [
        {
          id: "cond-002",
          type: "threshold_breach",
          field: "backup_retention_days",
          operator: "less_than",
          value: "30",
          enabled: true,
        },
      ],
      actions: [
        {
          id: "act-002",
          type: "create_ticket",
          config: { priority: "high", assignee: "backup-team" },
          enabled: true,
          order: 1,
        },
      ],
      schedule: {
        enabled: true,
        frequency: "daily",
        time: "02:00",
        timezone: "UTC",
      },
      notifications: [
        {
          id: "not-002",
          type: "slack",
          recipients: ["#backup-alerts"],
          template: "compliance_violation",
          enabled: true,
        },
      ],
      createdBy: "Jane Smith",
      createdAt: "2024-01-10T09:00:00Z",
      lastModified: "2024-01-18T11:15:00Z",
      executionCount: 89,
      successRate: 95.5,
      lastExecution: "2024-01-20T02:00:00Z",
    },
    {
      id: "pol-003",
      name: "Network Security Baseline",
      description: "Monitor network security configurations for unauthorized changes",
      status: "inactive",
      severity: "medium",
      scope: ["network", "firewall", "vpn"],
      conditions: [
        {
          id: "cond-003",
          type: "pattern_match",
          field: "firewall_rules",
          operator: "regex",
          value: "^allow.*0\\.0\\.0\\.0/0",
          enabled: true,
        },
      ],
      actions: [
        {
          id: "act-003",
          type: "send_notification",
          config: { urgency: "medium" },
          enabled: true,
          order: 1,
        },
      ],
      schedule: {
        enabled: false,
        frequency: "hourly",
        timezone: "UTC",
      },
      notifications: [
        {
          id: "not-003",
          type: "email",
          recipients: ["security@company.com"],
          template: "security_drift_alert",
          enabled: true,
        },
      ],
      createdBy: "Mike Johnson",
      createdAt: "2024-01-05T15:30:00Z",
      lastModified: "2024-01-12T09:45:00Z",
      executionCount: 45,
      successRate: 91.1,
      lastExecution: "2024-01-12T09:45:00Z",
    },
  ]

  const policyTemplates = [
    {
      id: "template-001",
      name: "AWS Security Group Monitoring",
      description: "Monitor AWS security group changes and auto-remediate unauthorized modifications",
      category: "Security",
      provider: "AWS",
      usageCount: 234,
    },
    {
      id: "template-002",
      name: "Database Configuration Compliance",
      description: "Ensure database configurations meet security and performance standards",
      category: "Database",
      provider: "Multi-Cloud",
      usageCount: 156,
    },
    {
      id: "template-003",
      name: "Kubernetes Resource Limits",
      description: "Monitor and enforce Kubernetes resource limits and quotas",
      category: "Container",
      provider: "Kubernetes",
      usageCount: 189,
    },
  ]

  const filteredPolicies = policies.filter((policy) => {
    const matchesSearch =
      policy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || policy.status === statusFilter
    const matchesSeverity = severityFilter === "all" || policy.severity === severityFilter
    return matchesSearch && matchesStatus && matchesSeverity
  })

  const handleSelectPolicy = (policyId: string) => {
    setSelectedPolicies((prev) =>
      prev.includes(policyId) ? prev.filter((id) => id !== policyId) : [...prev, policyId],
    )
  }

  const handleSelectAll = () => {
    setSelectedPolicies(selectedPolicies.length === filteredPolicies.length ? [] : filteredPolicies.map((p) => p.id))
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "inactive":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "draft":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuration Drift Policies</h1>
          <p className="text-muted-foreground">
            Define and manage automated policies for configuration drift detection and remediation
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Policy
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Drift Policy</DialogTitle>
                <DialogDescription>
                  Define a new policy for configuration drift detection and automated response
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                    <TabsTrigger value="conditions">Conditions</TabsTrigger>
                    <TabsTrigger value="actions">Actions</TabsTrigger>
                    <TabsTrigger value="schedule">Schedule</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="policy-name">Policy Name</Label>
                        <Input id="policy-name" placeholder="Enter policy name" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="policy-severity">Severity</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select severity" />
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
                      <Textarea
                        id="policy-description"
                        placeholder="Describe what this policy monitors and how it responds"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Scope (Tags/Resources)</Label>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">production</Badge>
                        <Badge variant="secondary">database</Badge>
                        <Badge variant="secondary">security-critical</Badge>
                        <Button variant="outline" size="sm">
                          <Plus className="h-3 w-3 mr-1" />
                          Add Tag
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="conditions" className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium">Detection Conditions</h4>
                        <Button variant="outline" size="sm">
                          <Plus className="h-3 w-3 mr-1" />
                          Add Condition
                        </Button>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-4 p-3 border rounded">
                          <Checkbox />
                          <div className="flex-1 grid grid-cols-4 gap-2">
                            <Select defaultValue="configuration_change">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="configuration_change">Configuration Change</SelectItem>
                                <SelectItem value="threshold_breach">Threshold Breach</SelectItem>
                                <SelectItem value="pattern_match">Pattern Match</SelectItem>
                                <SelectItem value="time_based">Time Based</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input placeholder="Field name" />
                            <Select defaultValue="not_equals">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="equals">Equals</SelectItem>
                                <SelectItem value="not_equals">Not Equals</SelectItem>
                                <SelectItem value="contains">Contains</SelectItem>
                                <SelectItem value="greater_than">Greater Than</SelectItem>
                                <SelectItem value="less_than">Less Than</SelectItem>
                                <SelectItem value="regex">Regex</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input placeholder="Expected value" />
                          </div>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="actions" className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium">Automated Actions</h4>
                        <Button variant="outline" size="sm">
                          <Plus className="h-3 w-3 mr-1" />
                          Add Action
                        </Button>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-4 p-3 border rounded">
                          <Checkbox defaultChecked />
                          <div className="flex-1 grid grid-cols-3 gap-2">
                            <Select defaultValue="auto_remediate">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="auto_remediate">Auto Remediate</SelectItem>
                                <SelectItem value="create_ticket">Create Ticket</SelectItem>
                                <SelectItem value="send_notification">Send Notification</SelectItem>
                                <SelectItem value="run_script">Run Script</SelectItem>
                                <SelectItem value="quarantine">Quarantine Resource</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input placeholder="Priority/Order" defaultValue="1" />
                            <Button variant="outline" size="sm">
                              Configure
                            </Button>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="schedule" className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="enable-schedule" defaultChecked />
                        <Label htmlFor="enable-schedule">Enable scheduled execution</Label>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Frequency</Label>
                          <Select defaultValue="continuous">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="continuous">Continuous</SelectItem>
                              <SelectItem value="hourly">Hourly</SelectItem>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Timezone</Label>
                          <Select defaultValue="UTC">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="UTC">UTC</SelectItem>
                              <SelectItem value="EST">Eastern Time</SelectItem>
                              <SelectItem value="PST">Pacific Time</SelectItem>
                              <SelectItem value="GMT">GMT</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="notifications" className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium">Notification Channels</h4>
                        <Button variant="outline" size="sm">
                          <Plus className="h-3 w-3 mr-1" />
                          Add Channel
                        </Button>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-4 p-3 border rounded">
                          <Checkbox defaultChecked />
                          <div className="flex-1 grid grid-cols-3 gap-2">
                            <Select defaultValue="email">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="slack">Slack</SelectItem>
                                <SelectItem value="webhook">Webhook</SelectItem>
                                <SelectItem value="sms">SMS</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input placeholder="Recipients" defaultValue="admin@company.com" />
                            <Select defaultValue="critical_drift_alert">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="critical_drift_alert">Critical Drift Alert</SelectItem>
                                <SelectItem value="compliance_violation">Compliance Violation</SelectItem>
                                <SelectItem value="security_drift_alert">Security Drift Alert</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsCreateDialogOpen(false)}>Create Policy</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Policies</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Policies</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">75% of total policies</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.8%</div>
            <p className="text-xs text-muted-foreground">+2.1% from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Executions Today</CardTitle>
            <Activity className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">+15% from yesterday</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="policies" className="space-y-4">
          {/* Filters and Search */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
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
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={severityFilter} onValueChange={setSeverityFilter}>
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
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bulk Actions */}
          {selectedPolicies.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{selectedPolicies.length} policies selected</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Play className="h-4 w-4 mr-2" />
                      Enable
                    </Button>
                    <Button variant="outline" size="sm">
                      <Pause className="h-4 w-4 mr-2" />
                      Disable
                    </Button>
                    <Button variant="outline" size="sm">
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Policies Table */}
          <Card>
            <CardHeader>
              <CardTitle>Drift Policies</CardTitle>
              <CardDescription>Manage your configuration drift detection and remediation policies</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedPolicies.length === filteredPolicies.length}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Policy</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Scope</TableHead>
                    <TableHead>Success Rate</TableHead>
                    <TableHead>Last Execution</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPolicies.map((policy) => (
                    <TableRow key={policy.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedPolicies.includes(policy.id)}
                          onCheckedChange={() => handleSelectPolicy(policy.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{policy.name}</div>
                          <div className="text-sm text-muted-foreground">{policy.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(policy.status)}>{policy.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getSeverityColor(policy.severity)}>{policy.severity}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {policy.scope.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {policy.scope.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{policy.scope.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={policy.successRate} className="w-16" />
                          <span className="text-sm">{policy.successRate}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{new Date(policy.lastExecution).toLocaleDateString()}</div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedPolicy(policy)
                              setIsEditDialogOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            {policy.status === "active" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Policy Templates</CardTitle>
              <CardDescription>Pre-built policy templates for common drift detection scenarios</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {policyTemplates.map((template) => (
                  <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <Badge variant="outline">{template.provider}</Badge>
                      </div>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{template.category}</Badge>
                          <span className="text-sm text-muted-foreground">{template.usageCount} uses</span>
                        </div>
                        <Button size="sm">Use Template</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Policy Execution Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <BarChart3 className="h-8 w-8 mr-2" />
                  Policy execution chart would be rendered here
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Success Rate Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Critical Policies</span>
                    <div className="flex items-center gap-2">
                      <Progress value={98.7} className="w-24" />
                      <span className="text-sm">98.7%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">High Priority</span>
                    <div className="flex items-center gap-2">
                      <Progress value={95.5} className="w-24" />
                      <span className="text-sm">95.5%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Medium Priority</span>
                    <div className="flex items-center gap-2">
                      <Progress value={91.1} className="w-24" />
                      <span className="text-sm">91.1%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Low Priority</span>
                    <div className="flex items-center gap-2">
                      <Progress value={87.3} className="w-24" />
                      <span className="text-sm">87.3%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Policy Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Policy</TableHead>
                    <TableHead>Executions (24h)</TableHead>
                    <TableHead>Success Rate</TableHead>
                    <TableHead>Avg Response Time</TableHead>
                    <TableHead>Issues Resolved</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Critical Infrastructure Drift</TableCell>
                    <TableCell>156</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={98.7} className="w-16" />
                        <span>98.7%</span>
                      </div>
                    </TableCell>
                    <TableCell>2.3s</TableCell>
                    <TableCell>23</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Backup Configuration Compliance</TableCell>
                    <TableCell>89</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={95.5} className="w-16" />
                        <span>95.5%</span>
                      </div>
                    </TableCell>
                    <TableCell>1.8s</TableCell>
                    <TableCell>12</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Network Security Baseline</TableCell>
                    <TableCell>45</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={91.1} className="w-16" />
                        <span>91.1%</span>
                      </div>
                    </TableCell>
                    <TableCell>3.1s</TableCell>
                    <TableCell>8</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Policy Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Policy: {selectedPolicy?.name}</DialogTitle>
            <DialogDescription>Modify the configuration drift policy settings</DialogDescription>
          </DialogHeader>
          {selectedPolicy && (
            <div className="space-y-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="conditions">Conditions</TabsTrigger>
                  <TabsTrigger value="actions">Actions</TabsTrigger>
                  <TabsTrigger value="schedule">Schedule</TabsTrigger>
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-policy-name">Policy Name</Label>
                      <Input id="edit-policy-name" defaultValue={selectedPolicy.name} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-policy-severity">Severity</Label>
                      <Select defaultValue={selectedPolicy.severity}>
                        <SelectTrigger>
                          <SelectValue />
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
                    <Label htmlFor="edit-policy-description">Description</Label>
                    <Textarea id="edit-policy-description" defaultValue={selectedPolicy.description} />
                  </div>
                  <div className="space-y-2">
                    <Label>Current Scope</Label>
                    <div className="flex flex-wrap gap-2">
                      {selectedPolicy.scope.map((tag) => (
                        <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                            <XCircle className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                      <Button variant="outline" size="sm">
                        <Plus className="h-3 w-3 mr-1" />
                        Add Tag
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="conditions" className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">Current Conditions</h4>
                      <Button variant="outline" size="sm">
                        <Plus className="h-3 w-3 mr-1" />
                        Add Condition
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {selectedPolicy.conditions.map((condition) => (
                        <div key={condition.id} className="flex items-center gap-4 p-3 border rounded">
                          <Checkbox defaultChecked={condition.enabled} />
                          <div className="flex-1 grid grid-cols-4 gap-2">
                            <Select defaultValue={condition.type}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="configuration_change">Configuration Change</SelectItem>
                                <SelectItem value="threshold_breach">Threshold Breach</SelectItem>
                                <SelectItem value="pattern_match">Pattern Match</SelectItem>
                                <SelectItem value="time_based">Time Based</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input defaultValue={condition.field} />
                            <Select defaultValue={condition.operator}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="equals">Equals</SelectItem>
                                <SelectItem value="not_equals">Not Equals</SelectItem>
                                <SelectItem value="contains">Contains</SelectItem>
                                <SelectItem value="greater_than">Greater Than</SelectItem>
                                <SelectItem value="less_than">Less Than</SelectItem>
                                <SelectItem value="regex">Regex</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input defaultValue={condition.value} />
                          </div>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="actions" className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">Current Actions</h4>
                      <Button variant="outline" size="sm">
                        <Plus className="h-3 w-3 mr-1" />
                        Add Action
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {selectedPolicy.actions.map((action) => (
                        <div key={action.id} className="flex items-center gap-4 p-3 border rounded">
                          <Checkbox defaultChecked={action.enabled} />
                          <div className="flex-1 grid grid-cols-3 gap-2">
                            <Select defaultValue={action.type}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="auto_remediate">Auto Remediate</SelectItem>
                                <SelectItem value="create_ticket">Create Ticket</SelectItem>
                                <SelectItem value="send_notification">Send Notification</SelectItem>
                                <SelectItem value="run_script">Run Script</SelectItem>
                                <SelectItem value="quarantine">Quarantine Resource</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input defaultValue={action.order.toString()} />
                            <Button variant="outline" size="sm">
                              Configure
                            </Button>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="schedule" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="edit-enable-schedule" defaultChecked={selectedPolicy.schedule.enabled} />
                      <Label htmlFor="edit-enable-schedule">Enable scheduled execution</Label>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Frequency</Label>
                        <Select defaultValue={selectedPolicy.schedule.frequency}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="continuous">Continuous</SelectItem>
                            <SelectItem value="hourly">Hourly</SelectItem>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Timezone</Label>
                        <Select defaultValue={selectedPolicy.schedule.timezone}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="UTC">UTC</SelectItem>
                            <SelectItem value="EST">Eastern Time</SelectItem>
                            <SelectItem value="PST">Pacific Time</SelectItem>
                            <SelectItem value="GMT">GMT</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="notifications" className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">Current Notifications</h4>
                      <Button variant="outline" size="sm">
                        <Plus className="h-3 w-3 mr-1" />
                        Add Channel
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {selectedPolicy.notifications.map((notification) => (
                        <div key={notification.id} className="flex items-center gap-4 p-3 border rounded">
                          <Checkbox defaultChecked={notification.enabled} />
                          <div className="flex-1 grid grid-cols-3 gap-2">
                            <Select defaultValue={notification.type}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="slack">Slack</SelectItem>
                                <SelectItem value="webhook">Webhook</SelectItem>
                                <SelectItem value="sms">SMS</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input defaultValue={notification.recipients.join(", ")} />
                            <Select defaultValue={notification.template}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="critical_drift_alert">Critical Drift Alert</SelectItem>
                                <SelectItem value="compliance_violation">Compliance Violation</SelectItem>
                                <SelectItem value="security_drift_alert">Security Drift Alert</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsEditDialogOpen(false)}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
