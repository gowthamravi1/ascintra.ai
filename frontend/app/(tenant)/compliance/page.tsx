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
  MapPin,
  Lock,
  Eye,
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

// Mock data for DORA compliance
const doraData = {
  backupCoverage: 87,
  averageRecoveryTime: 45,
  unrecoverableResources: 12,
  recoveryReadinessScore: 92,
  testResults: { pass: 156, fail: 23 },
  mttr: 32,
  lastSuccessfulRestore: "2024-01-15T14:30:00Z",
  nonCompliantByRegion: [
    { region: "us-east-1", count: 5 },
    { region: "eu-west-1", count: 3 },
    { region: "ap-southeast-1", count: 4 },
  ],
  configDrift: [
    { date: "2024-01-01", count: 8 },
    { date: "2024-01-08", count: 12 },
    { date: "2024-01-15", count: 6 },
    { date: "2024-01-22", count: 15 },
  ],
}

// Mock data for SOC 2 Type II
const soc2Data = {
  policyAdherence: { compliant: 85, nonCompliant: 15 },
  immutableBackupStatus: "pass",
  retentionCompliance: [
    { policy: "Daily", compliance: 95 },
    { policy: "Weekly", compliance: 88 },
    { policy: "Monthly", compliance: 92 },
    { policy: "Yearly", compliance: 100 },
  ],
  alertingHealth: "green",
  criticalWorkloadStatus: "operational",
  validationEvents: [
    { date: "2024-01-15", event: "Backup Validation", status: "success" },
    { date: "2024-01-14", event: "Recovery Test", status: "success" },
    { date: "2024-01-13", event: "Encryption Check", status: "warning" },
    { date: "2024-01-12", event: "Policy Audit", status: "success" },
  ],
  encryptionCompliance: {
    atRest: "compliant",
    inTransit: "compliant",
    keyManagement: "compliant",
  },
  thirdPartyCompliance: "compliant",
}

export default function CompliancePage() {
  const [selectedProvider, setSelectedProvider] = useState("aws")
  const [selectedRegion, setSelectedRegion] = useState("")
  const [selectedServices, setSelectedServices] = useState<string[]>([])

  const handleServiceToggle = (serviceValue: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceValue) ? prev.filter((s) => s !== serviceValue) : [...prev, serviceValue],
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-600"
      case "warning":
        return "text-yellow-600"
      case "error":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case "green":
        return "bg-green-500"
      case "orange":
        return "bg-orange-500"
      case "red":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
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
          <TabsTrigger value="dora">DORA Compliance</TabsTrigger>
          <TabsTrigger value="soc2">SOC 2 Type II</TabsTrigger>
        </TabsList>

        {/* DORA Tab */}
        <TabsContent value="dora" className="space-y-6">
          {/* Top Row - Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Backup Coverage */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Backup Coverage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{doraData.backupCoverage}%</div>
                <div className="flex items-center gap-2 mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">+2.3% from last month</span>
                </div>
                <div className="mt-3">
                  <Progress value={doraData.backupCoverage} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Average Recovery Time */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Avg Recovery Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{doraData.averageRecoveryTime}m</div>
                <div className="flex items-center gap-2 mt-2">
                  <TrendingDown className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">-5m improvement</span>
                </div>
                <div className="mt-3 h-8 flex items-end gap-1">
                  {[40, 45, 38, 42, 35, 30, 45].map((height, i) => (
                    <div key={i} className="bg-blue-200 flex-1" style={{ height: `${height}%` }} />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Unrecoverable Resources */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Unrecoverable Resources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{doraData.unrecoverableResources}</div>
                <div className="flex items-center gap-2 mt-2">
                  <TrendingUp className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-600">+3 from last week</span>
                </div>
                <Button variant="outline" size="sm" className="mt-3 w-full bg-transparent">
                  View Details
                </Button>
              </CardContent>
            </Card>

            {/* Recovery Readiness Score */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Gauge className="h-4 w-4" />
                  Recovery Readiness
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{doraData.recoveryReadinessScore}%</div>
                <div className="flex items-center gap-2 mt-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">Excellent</span>
                </div>
                <div className="mt-3">
                  <Progress value={doraData.recoveryReadinessScore} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Second Row - Charts and Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Test Recovery Simulation Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Test Recovery Simulation Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Passed Tests</span>
                    <span className="text-sm font-bold text-green-600">{doraData.testResults.pass}</span>
                  </div>
                  <Progress
                    value={(doraData.testResults.pass / (doraData.testResults.pass + doraData.testResults.fail)) * 100}
                    className="h-3"
                  />

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Failed Tests</span>
                    <span className="text-sm font-bold text-red-600">{doraData.testResults.fail}</span>
                  </div>
                  <Progress
                    value={(doraData.testResults.fail / (doraData.testResults.pass + doraData.testResults.fail)) * 100}
                    className="h-3"
                  />

                  <div className="pt-2 border-t">
                    <div className="text-sm text-muted-foreground">
                      Success Rate:{" "}
                      {Math.round(
                        (doraData.testResults.pass / (doraData.testResults.pass + doraData.testResults.fail)) * 100,
                      )}
                      %
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* MTTR and Last Restore */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recovery Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium">Mean Time to Recover (MTTR)</div>
                    <div className="text-2xl font-bold">{doraData.mttr}m</div>
                  </div>
                  <Clock className="h-8 w-8 text-blue-500" />
                </div>

                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium">Last Successful Restore</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(doraData.lastSuccessfulRestore).toLocaleString()}
                    </div>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Third Row - Regional and Drift Data */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Non-Compliant Resources by Region */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Non-Compliant Resources by Region
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {doraData.nonCompliantByRegion.map((item) => (
                    <div key={item.region} className="flex justify-between items-center p-2 border rounded">
                      <span className="font-medium">{item.region}</span>
                      <Badge variant={item.count > 4 ? "destructive" : "secondary"}>{item.count} resources</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Configuration Drift */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Configuration Drift (Last 30 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {doraData.configDrift.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">{new Date(item.date).toLocaleDateString()}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-muted rounded-full h-2">
                          <div
                            className="bg-orange-500 h-2 rounded-full"
                            style={{ width: `${(item.count / 20) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{item.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* SOC 2 Type II Tab */}
        <TabsContent value="soc2" className="space-y-6">
          {/* Top Row - Policy and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Recovery Policy Adherence */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Recovery Policy Adherence
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
                          strokeDasharray={`${soc2Data.policyAdherence.compliant}, 100`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xl font-bold">{soc2Data.policyAdherence.compliant}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">
                      {soc2Data.policyAdherence.nonCompliant}% non-compliant
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Immutable Backup Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Immutable Backup Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div
                    className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
                      soc2Data.immutableBackupStatus === "pass" ? "bg-green-100" : "bg-red-100"
                    }`}
                  >
                    {soc2Data.immutableBackupStatus === "pass" ? (
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-8 w-8 text-red-600" />
                    )}
                  </div>
                  <div>
                    <div className="text-lg font-bold capitalize">{soc2Data.immutableBackupStatus}</div>
                    <div className="text-sm text-muted-foreground">All backups are immutable and tamper-proof</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Alerting System Health */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Alerting System Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className={`w-16 h-16 mx-auto rounded-full ${getHealthColor(soc2Data.alertingHealth)}`} />
                  <div>
                    <div className="text-lg font-bold capitalize">{soc2Data.alertingHealth}</div>
                    <div className="text-sm text-muted-foreground">All monitoring systems operational</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Second Row - Retention and Workload Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Retention Policy Compliance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Retention Policy Compliance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {soc2Data.retentionCompliance.map((item) => (
                    <div key={item.policy} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">{item.policy} Retention</span>
                        <span className="text-sm font-bold">{item.compliance}%</span>
                      </div>
                      <Progress value={item.compliance} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Critical Workload Recovery Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Critical Workload Recovery Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <div className="text-lg font-bold capitalize">{soc2Data.criticalWorkloadStatus}</div>
                    <div className="text-sm text-muted-foreground">
                      All critical workloads have valid recovery plans
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    View Workloads
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Third Row - Events and Encryption */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Historical Recovery Validation Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Historical Recovery Validation Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {soc2Data.validationEvents.map((event, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{event.event}</div>
                        <div className="text-sm text-muted-foreground">{new Date(event.date).toLocaleDateString()}</div>
                      </div>
                      <Badge
                        variant={
                          event.status === "success"
                            ? "default"
                            : event.status === "warning"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {event.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Backup Encryption Compliance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Backup Encryption Compliance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="font-medium">Encryption at Rest</span>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="font-medium">Encryption in Transit</span>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="font-medium">Key Management</span>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Third-party Tool Compliance</span>
                      <Badge variant="default">Compliant</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Configuration Drift Detection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Configuration Drift Detection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold">24</div>
                    <div className="text-sm text-muted-foreground">Drifts Detected</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold">18</div>
                    <div className="text-sm text-muted-foreground">Auto-Remediated</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold">6</div>
                    <div className="text-sm text-muted-foreground">Pending Review</div>
                  </div>
                </div>
                <div className="text-center">
                  <Button variant="outline">View Drift Timeline</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
