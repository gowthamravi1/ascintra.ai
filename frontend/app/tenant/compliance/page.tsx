"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Shield,
  TrendingUp,
  TrendingDown,
  Activity,
  Server,
  Gauge,
  BarChart3,
  Calendar,
  Download,
  RefreshCw,
} from "lucide-react"

const cloudProviders = [
  { value: "aws", label: "AWS" },
  { value: "azure", label: "Azure" },
  { value: "gcp", label: "GCP" },
]

const regions = {
  aws: ["us-east-1", "us-west-2", "eu-west-1", "ap-southeast-1"],
  azure: ["eastus", "westus2", "westeurope", "southeastasia"],
  gcp: ["us-central1", "us-west1", "europe-west1", "asia-south1"],
}

const serviceTypes = [
  { value: "ec2", label: "EC2" },
  { value: "s3", label: "S3" },
  { value: "rds", label: "RDS" },
  { value: "ebs", label: "EBS" },
  { value: "kubernetes", label: "Kubernetes" },
  { value: "functions", label: "Functions" },
]

// Mock data for DORA Sections 9, 10, 11 (Recovery Focus)
const doraData = {
  rto: { current: 4, target: 6, unit: "hours" },
  rpo: { current: 15, target: 30, unit: "minutes" },
  businessContinuityScore: 94,
  incidentResponseReadiness: 78,
  recoveryTestResults: { successful: 89, partial: 8, failed: 3 },
  businessImpact: {
    critical: { count: 24, rto: "1h" },
    important: { count: 67, rto: "4h" },
    standard: { count: 156, rto: "24h" },
  },
  incidentMetrics: {
    mttd: 12, // minutes
    mttr: 28, // minutes
    mttr_recovery: 2.4, // hours
  },
  recoveryCapabilities: {
    backupInfrastructure: 95,
    recoveryAutomation: 82,
    disasterRecoveryPlans: 88,
    communicationProtocols: 76,
  },
}

// Mock data for SOC 2 Type II RECOVER functions
const soc2Data = {
  recoveryPlanCoverage: { covered: 247, total: 271, percentage: 91 },
  processMaturity: { level: 4, description: "Managed & Measurable" },
  testingFrequency: "Monthly",
  recoveryStrategies: {
    hotSite: 100,
    warmSite: 87,
    coldSite: 94,
    cloudToCloud: 78,
  },
  communicationPlan: {
    stakeholderNotification: "compliant",
    customerCommunication: "compliant",
    regulatoryReporting: "needs_update",
    mediaRelations: "compliant",
  },
  lessonsLearned: [
    { title: "Q4 2023 Recovery Exercise", improvements: 12, status: "implemented" },
    { title: "Security Incident Response", improvements: 8, status: "implemented" },
    { title: "Cloud Migration Recovery", improvements: 5, status: "in_progress" },
    { title: "Third-Party Integration", improvements: 3, status: "planned" },
  ],
  recoveryMetrics: {
    successRate: 99.8,
    avgRecoveryTime: 2.1,
    maxDataLoss: 15,
    planEffectiveness: 94,
  },
  crpmSummary: {
    overallGrade: "A+",
    protectedResources: 247,
    recoveryStrategies: 12,
    improvementAreas: 3,
  },
}

export default function ComplianceDashboardPage() {
  const [selectedProvider, setSelectedProvider] = useState("aws")
  const [selectedRegion, setSelectedRegion] = useState("")
  const [selectedServices, setSelectedServices] = useState<string[]>([])

  const handleServiceToggle = (serviceValue: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceValue) ? prev.filter((s) => s !== serviceValue) : [...prev, serviceValue],
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Compliance Dashboard</h1>
          <p className="text-muted-foreground">Monitor DORA and SOC 2 Type II compliance across your infrastructure</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
          <Button variant="outline" className="gap-2 bg-transparent">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Global Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Cloud Provider */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Cloud Provider</label>
              <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                <SelectTrigger>
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  {cloudProviders.map((provider) => (
                    <SelectItem key={provider.value} value={provider.value}>
                      {provider.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Region */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Region</label>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {regions[selectedProvider as keyof typeof regions]?.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Service Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Service Type</label>
              <div className="border rounded-md p-2 max-h-32 overflow-y-auto">
                {serviceTypes.map((service) => (
                  <div key={service.value} className="flex items-center space-x-2 py-1">
                    <Checkbox
                      id={service.value}
                      checked={selectedServices.includes(service.value)}
                      onCheckedChange={() => handleServiceToggle(service.value)}
                    />
                    <label htmlFor={service.value} className="text-sm">
                      {service.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="dora" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dora">DORA (Sections 9, 10, 11)</TabsTrigger>
          <TabsTrigger value="soc2">SOC 2 Type II (RECOVER)</TabsTrigger>
        </TabsList>

        {/* DORA Tab - Sections 9, 10, 11 Only */}
        <TabsContent value="dora" className="space-y-6">
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900">DORA Compliance Focus Areas</h3>
            <p className="text-sm text-blue-700 mt-1">
              Section 9: Backup & Recovery | Section 10: Business Continuity | Section 11: Incident Response
            </p>
          </div>

          {/* Recovery Posture Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Recovery Time Objective (RTO) */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Recovery Time Objective (RTO)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4h</div>
                <div className="flex items-center gap-2 mt-2">
                  <TrendingDown className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">Target: 6h</span>
                </div>
                <div className="mt-3">
                  <Progress value={67} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Recovery Point Objective (RPO) */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Recovery Point Objective (RPO)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">15m</div>
                <div className="flex items-center gap-2 mt-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">Target: 30m</span>
                </div>
                <div className="mt-3">
                  <Progress value={85} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Business Continuity Score */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Business Continuity Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">94%</div>
                <div className="flex items-center gap-2 mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">+3% this month</span>
                </div>
                <div className="mt-3">
                  <Progress value={94} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Incident Response Readiness */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Incident Response Readiness
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">78%</div>
                <div className="flex items-center gap-2 mt-2">
                  <TrendingUp className="h-4 w-4 text-orange-500" />
                  <span className="text-sm text-orange-600">Needs improvement</span>
                </div>
                <div className="mt-3">
                  <Progress value={78} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recovery Testing and Validation */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recovery Test Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Recovery Test Results (Section 9)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Successful Recovery Tests</span>
                    <span className="text-sm font-bold text-green-600">89%</span>
                  </div>
                  <Progress value={89} className="h-3" />

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Partial Recovery Tests</span>
                    <span className="text-sm font-bold text-orange-600">8%</span>
                  </div>
                  <Progress value={8} className="h-3" />

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Failed Recovery Tests</span>
                    <span className="text-sm font-bold text-red-600">3%</span>
                  </div>
                  <Progress value={3} className="h-3" />

                  <div className="pt-2 border-t">
                    <div className="text-sm text-muted-foreground">
                      Last Test: {new Date().toLocaleDateString()} | Next Test:{" "}
                      {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Business Impact Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Business Impact Analysis (Section 10)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium">Critical Services</div>
                    <div className="text-2xl font-bold">24</div>
                  </div>
                  <div className="text-sm text-red-600">RTO: 1h</div>
                </div>

                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium">Important Services</div>
                    <div className="text-2xl font-bold">67</div>
                  </div>
                  <div className="text-sm text-orange-600">RTO: 4h</div>
                </div>

                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium">Standard Services</div>
                    <div className="text-2xl font-bold">156</div>
                  </div>
                  <div className="text-sm text-green-600">RTO: 24h</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Incident Response Capabilities */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Incident Response Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Incident Response Metrics (Section 11)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <div>
                      <div className="text-sm font-medium">Mean Time to Detection (MTTD)</div>
                      <div className="text-xl font-bold">12m</div>
                    </div>
                    <TrendingDown className="h-6 w-6 text-green-500" />
                  </div>

                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <div>
                      <div className="text-sm font-medium">Mean Time to Response (MTTR)</div>
                      <div className="text-xl font-bold">28m</div>
                    </div>
                    <TrendingDown className="h-6 w-6 text-green-500" />
                  </div>

                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <div>
                      <div className="text-sm font-medium">Mean Time to Recovery (MTTR)</div>
                      <div className="text-xl font-bold">2.4h</div>
                    </div>
                    <TrendingUp className="h-6 w-6 text-orange-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recovery Capabilities Assessment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gauge className="h-5 w-5" />
                  Recovery Capabilities Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Backup Infrastructure</span>
                    <div className="flex items-center gap-2">
                      <Progress value={95} className="w-16 h-2" />
                      <span className="text-sm font-bold">95%</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Recovery Automation</span>
                    <div className="flex items-center gap-2">
                      <Progress value={82} className="w-16 h-2" />
                      <span className="text-sm font-bold">82%</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Disaster Recovery Plans</span>
                    <div className="flex items-center gap-2">
                      <Progress value={88} className="w-16 h-2" />
                      <span className="text-sm font-bold">88%</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Communication Protocols</span>
                    <div className="flex items-center gap-2">
                      <Progress value={76} className="w-16 h-2" />
                      <span className="text-sm font-bold">76%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* SOC 2 Type II Tab - RECOVER Functions Only */}
        <TabsContent value="soc2" className="space-y-6">
          <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h3 className="font-semibold text-purple-900">SOC 2 Type II - RECOVER Functions</h3>
            <p className="text-sm text-purple-700 mt-1">
              Recovery planning, implementation, and improvement activities for Cloud Recovery Posture Management
            </p>
          </div>

          {/* Recovery Planning and Implementation */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Recovery Plan Coverage */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Recovery Plan Coverage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="relative w-32 h-32">
                      <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#e5e7eb"
                          strokeWidth="2"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="2"
                          strokeDasharray="91, 100"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xl font-bold">91%</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">247 of 271 critical systems covered</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recovery Process Maturity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recovery Process Maturity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <div className="text-lg font-bold">Level 4</div>
                    <div className="text-sm text-muted-foreground">Managed & Measurable</div>
                  </div>
                  <div className="text-xs text-green-600">Automated recovery processes with continuous improvement</div>
                </div>
              </CardContent>
            </Card>

            {/* Recovery Testing Frequency */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Recovery Testing Frequency
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-blue-100 flex items-center justify-center">
                    <Clock className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-lg font-bold">Monthly</div>
                    <div className="text-sm text-muted-foreground">Automated Testing</div>
                  </div>
                  <div className="text-xs text-blue-600">Last test: 3 days ago | Next: 27 days</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recovery Implementation Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recovery Strategy Implementation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Recovery Strategy Implementation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Hot Site Recovery</span>
                      <span className="text-sm font-bold">100%</span>
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Warm Site Recovery</span>
                      <span className="text-sm font-bold">87%</span>
                    </div>
                    <Progress value={87} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Cold Site Recovery</span>
                      <span className="text-sm font-bold">94%</span>
                    </div>
                    <Progress value={94} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Cloud-to-Cloud Recovery</span>
                      <span className="text-sm font-bold">78%</span>
                    </div>
                    <Progress value={78} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recovery Communication Plan */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recovery Communication Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <div>
                      <div className="font-medium">Stakeholder Notification</div>
                      <div className="text-sm text-muted-foreground">Automated alerts configured</div>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>

                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <div>
                      <div className="font-medium">Customer Communication</div>
                      <div className="text-sm text-muted-foreground">Multi-channel messaging ready</div>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>

                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                    <div>
                      <div className="font-medium">Regulatory Reporting</div>
                      <div className="text-sm text-muted-foreground">Templates need update</div>
                    </div>
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                  </div>

                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <div>
                      <div className="font-medium">Media Relations</div>
                      <div className="text-sm text-muted-foreground">Crisis communication plan active</div>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recovery Improvement Activities */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Lessons Learned Implementation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Lessons Learned Implementation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">Q4 2023 Recovery Exercise</div>
                      <div className="text-sm text-muted-foreground">12 improvements identified</div>
                    </div>
                    <Badge variant="default">Implemented</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">Security Incident Response</div>
                      <div className="text-sm text-muted-foreground">8 process enhancements</div>
                    </div>
                    <Badge variant="default">Implemented</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">Cloud Migration Recovery</div>
                      <div className="text-sm text-muted-foreground">5 automation improvements</div>
                    </div>
                    <Badge variant="secondary">In Progress</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">Third-Party Integration</div>
                      <div className="text-sm text-muted-foreground">3 vendor process updates</div>
                    </div>
                    <Badge variant="outline">Planned</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recovery Metrics & KPIs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Recovery Metrics & KPIs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">99.8%</div>
                      <div className="text-sm text-muted-foreground">Recovery Success Rate</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">2.1h</div>
                      <div className="text-sm text-muted-foreground">Avg Recovery Time</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">15m</div>
                      <div className="text-sm text-muted-foreground">Max Data Loss (RPO)</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">94%</div>
                      <div className="text-sm text-muted-foreground">Plan Effectiveness</div>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="text-center">
                      <Button variant="outline" size="sm">
                        View Detailed Metrics
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recovery Posture Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="h-5 w-5" />
                Cloud Recovery Posture Management (CRPM) Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">A+</div>
                  <div className="text-sm text-muted-foreground">Overall Recovery Grade</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">247</div>
                  <div className="text-sm text-muted-foreground">Protected Resources</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">12</div>
                  <div className="text-sm text-muted-foreground">Recovery Strategies</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">3</div>
                  <div className="text-sm text-muted-foreground">Improvement Areas</div>
                </div>
              </div>
              <div className="mt-4 text-center">
                <Button variant="outline">Generate CRPM Report</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
