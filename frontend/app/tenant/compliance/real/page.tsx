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
  Play,
  Loader2,
} from "lucide-react"
import { useComplianceData } from "@/hooks/use-compliance-data"

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

export default function ComplianceDashboardPage() {
  const [selectedProvider, setSelectedProvider] = useState("aws")
  const [selectedRegion, setSelectedRegion] = useState("")
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [evaluating, setEvaluating] = useState(false)

  // Use a default account ID for now - in a real app, this would come from context/auth
  const accountId = "84696d9a-174c-4093-b907-1f331da0d1f5"
  
  const {
    frameworks,
    rules,
    scores,
    dashboard,
    loading,
    error,
    refreshData,
    evaluateCompliance,
  } = useComplianceData(accountId)

  const handleServiceToggle = (serviceValue: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceValue) ? prev.filter((s) => s !== serviceValue) : [...prev, serviceValue],
    )
  }

  const handleEvaluateCompliance = async (frameworkId?: string) => {
    setEvaluating(true)
    try {
      await evaluateCompliance(frameworkId, true)
    } catch (err) {
      console.error('Evaluation failed:', err)
    } finally {
      setEvaluating(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 90) return "default"
    if (score >= 70) return "secondary"
    return "destructive"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading compliance data...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600">{error}</p>
          <Button onClick={refreshData} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
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
          <Button 
            variant="outline" 
            className="gap-2 bg-transparent"
            onClick={() => handleEvaluateCompliance()}
            disabled={evaluating}
          >
            {evaluating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {evaluating ? 'Evaluating...' : 'Run Evaluation'}
          </Button>
          <Button variant="outline" className="gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
          <Button variant="outline" className="gap-2 bg-transparent" onClick={refreshData}>
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

      {/* Compliance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Overall Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(dashboard?.overall_score || 0)}`}>
              {dashboard?.overall_score?.toFixed(1) || 0}%
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={getScoreBadgeVariant(dashboard?.overall_score || 0)}>
                {dashboard?.overall_score >= 90 ? 'Excellent' : 
                 dashboard?.overall_score >= 70 ? 'Good' : 'Needs Improvement'}
              </Badge>
            </div>
            <div className="mt-3">
              <Progress value={dashboard?.overall_score || 0} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Critical Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{dashboard?.critical_issues || 0}</div>
            <div className="text-sm text-muted-foreground mt-2">
              Rules failed
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Resources Evaluated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.total_resources_evaluated || 0}</div>
            <div className="text-sm text-muted-foreground mt-2">
              Total resources
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Gauge className="h-4 w-4" />
              Frameworks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{frameworks.length}</div>
            <div className="text-sm text-muted-foreground mt-2">
              Active frameworks
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="dora">DORA</TabsTrigger>
          <TabsTrigger value="soc2">SOC 2</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Frameworks Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Compliance Frameworks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {frameworks.map((framework) => {
                    const frameworkScore = scores.find(s => s.framework_id === framework.id)
                    return (
                      <div key={framework.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{framework.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {framework.version} • {framework.enabled_rules} rules
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${getScoreColor(frameworkScore?.compliance_score || 0)}`}>
                            {frameworkScore?.compliance_score?.toFixed(1) || 'N/A'}%
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEvaluateCompliance(framework.id)}
                            disabled={evaluating}
                          >
                            {evaluating ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Play className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Recent Evaluations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Evaluations
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dashboard?.recent_evaluations?.length ? (
                  <div className="space-y-3">
                    {dashboard.recent_evaluations.slice(0, 5).map((evaluation) => (
                      <div key={evaluation.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">
                            {new Date(evaluation.evaluation_date).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {evaluation.passed_rules}/{evaluation.total_rules} rules passed
                          </div>
                        </div>
                        <div className={`text-lg font-bold ${getScoreColor(evaluation.compliance_score)}`}>
                          {evaluation.compliance_score.toFixed(1)}%
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-8 w-8 mx-auto mb-2" />
                    <p>No evaluations yet</p>
                    <Button 
                      size="sm" 
                      className="mt-2"
                      onClick={() => handleEvaluateCompliance()}
                      disabled={evaluating}
                    >
                      Run First Evaluation
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Rules Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Compliance Rules Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {frameworks.map((framework) => {
                  const frameworkRules = rules.filter(r => r.framework_id === framework.id)
                  const enabledRules = frameworkRules.filter(r => r.enabled)
                  const criticalRules = enabledRules.filter(r => r.severity === 'high')
                  
                  return (
                    <div key={framework.id} className="p-4 border rounded-lg">
                      <div className="font-medium mb-2">{framework.name}</div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Total Rules:</span>
                          <span className="font-medium">{frameworkRules.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Enabled:</span>
                          <span className="font-medium text-green-600">{enabledRules.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Critical:</span>
                          <span className="font-medium text-red-600">{criticalRules.length}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* DORA Tab */}
        <TabsContent value="dora" className="space-y-6">
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900">DORA Compliance Framework</h3>
            <p className="text-sm text-blue-700 mt-1">
              Digital Operational Resilience Act (DORA) compliance for ICT risk management
            </p>
          </div>

          {scores.find(s => s.framework_name === 'DORA') ? (
            <div className="space-y-6">
              {/* DORA Score */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    DORA Compliance Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-4">
                    <div className={`text-4xl font-bold ${getScoreColor(scores.find(s => s.framework_name === 'DORA')?.compliance_score || 0)}`}>
                      {scores.find(s => s.framework_name === 'DORA')?.compliance_score.toFixed(1) || 0}%
                    </div>
                    <div className="text-muted-foreground">
                      {scores.find(s => s.framework_name === 'DORA')?.passed_rules || 0} of {scores.find(s => s.framework_name === 'DORA')?.total_rules || 0} rules passed
                    </div>
                    <Progress 
                      value={scores.find(s => s.framework_name === 'DORA')?.compliance_score || 0} 
                      className="h-3" 
                    />
                  </div>
                </CardContent>
              </Card>

              {/* DORA Categories */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    DORA Categories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(scores.find(s => s.framework_name === 'DORA')?.categories || {}).map(([category, stats]) => (
                      <div key={category} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{category}</span>
                          <span className={`font-bold ${getScoreColor(stats.score)}`}>
                            {stats.score.toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={stats.score} className="h-2" />
                        <div className="flex justify-between text-sm text-muted-foreground mt-2">
                          <span>{stats.passed} passed</span>
                          <span>{stats.failed} failed</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Shield className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">No DORA evaluation data available</p>
                <Button onClick={() => handleEvaluateCompliance()}>
                  Run DORA Evaluation
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* SOC 2 Tab */}
        <TabsContent value="soc2" className="space-y-6">
          <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h3 className="font-semibold text-purple-900">SOC 2 Type II Compliance</h3>
            <p className="text-sm text-purple-700 mt-1">
              SOC 2 Type II compliance for security, availability, processing integrity, confidentiality, and privacy
            </p>
          </div>

          {scores.find(s => s.framework_name === 'SOC 2') ? (
            <div className="space-y-6">
              {/* SOC 2 Score */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    SOC 2 Compliance Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-4">
                    <div className={`text-4xl font-bold ${getScoreColor(scores.find(s => s.framework_name === 'SOC 2')?.compliance_score || 0)}`}>
                      {scores.find(s => s.framework_name === 'SOC 2')?.compliance_score.toFixed(1) || 0}%
                    </div>
                    <div className="text-muted-foreground">
                      {scores.find(s => s.framework_name === 'SOC 2')?.passed_rules || 0} of {scores.find(s => s.framework_name === 'SOC 2')?.total_rules || 0} rules passed
                    </div>
                    <Progress 
                      value={scores.find(s => s.framework_name === 'SOC 2')?.compliance_score || 0} 
                      className="h-3" 
                    />
                  </div>
                </CardContent>
              </Card>

              {/* SOC 2 Categories */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    SOC 2 Categories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(scores.find(s => s.framework_name === 'SOC 2')?.categories || {}).map(([category, stats]) => (
                      <div key={category} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{category}</span>
                          <span className={`font-bold ${getScoreColor(stats.score)}`}>
                            {stats.score.toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={stats.score} className="h-2" />
                        <div className="flex justify-between text-sm text-muted-foreground mt-2">
                          <span>{stats.passed} passed</span>
                          <span>{stats.failed} failed</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Shield className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">No SOC 2 evaluation data available</p>
                <Button onClick={() => handleEvaluateCompliance()}>
                  Run SOC 2 Evaluation
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
