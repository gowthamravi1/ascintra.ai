"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Target, AlertTriangle, TrendingUp, Database, Server } from "lucide-react"

const rtoRpoData = [
  { service: "EC2", rto: 120, rpo: 15, target_rto: 240, target_rpo: 60, resources: 45, critical: 8 },
  { service: "RDS", rto: 60, rpo: 5, target_rto: 120, target_rpo: 15, resources: 12, critical: 2 },
  { service: "S3", rto: 30, rpo: 60, target_rto: 60, target_rpo: 240, resources: 23, critical: 0 },
  { service: "EBS", rto: 45, rpo: 240, target_rto: 120, target_rpo: 480, resources: 178, critical: 12 },
  { service: "Lambda", rto: 5, rpo: 0, target_rto: 15, target_rpo: 5, resources: 67, critical: 0 },
  { service: "DynamoDB", rto: 15, rpo: 1, target_rto: 30, target_rpo: 5, resources: 8, critical: 0 },
]

const businessImpactData = [
  { tier: "Critical", rto_target: 60, rpo_target: 15, resources: 45, current_rto: 75, current_rpo: 20 },
  { tier: "Important", rto_target: 240, rpo_target: 60, resources: 128, current_rto: 180, current_rpo: 45 },
  { tier: "Standard", rto_target: 480, rpo_target: 240, resources: 160, current_rto: 320, current_rpo: 180 },
]

const recoveryDistribution = [
  { name: "Meeting RTO/RPO", value: 65, color: "#10b981" },
  { name: "Exceeding RPO", value: 20, color: "#f59e0b" },
  { name: "Exceeding RTO", value: 10, color: "#ef4444" },
  { name: "Exceeding Both", value: 5, color: "#dc2626" },
]

const timeSeriesData = [
  { month: "Jan", avg_rto: 180, avg_rpo: 45, target_rto: 240, target_rpo: 60 },
  { month: "Feb", avg_rto: 165, avg_rpo: 40, target_rto: 240, target_rpo: 60 },
  { month: "Mar", avg_rto: 150, avg_rpo: 35, target_rto: 240, target_rpo: 60 },
  { month: "Apr", avg_rto: 140, avg_rpo: 32, target_rto: 240, target_rpo: 60 },
  { month: "May", avg_rto: 135, avg_rpo: 30, target_rto: 240, target_rpo: 60 },
  { month: "Jun", avg_rto: 128, avg_rpo: 28, target_rto: 240, target_rpo: 60 },
]

export default function RtoRpoAnalysisPage() {
  const [selectedTier, setSelectedTier] = useState("all")

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  const getComplianceStatus = (current: number, target: number) => {
    if (current <= target) return "compliant"
    if (current <= target * 1.2) return "warning"
    return "critical"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "compliant":
        return "text-success"
      case "warning":
        return "text-warning"
      case "critical":
        return "text-critical"
      default:
        return "text-muted-foreground"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">RTO/RPO Analysis</h1>
          <p className="text-muted-foreground">Recovery Time and Recovery Point Objective performance analysis</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedTier} onValueChange={setSelectedTier}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tiers</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="important">Important</SelectItem>
              <SelectItem value="standard">Standard</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2 bg-transparent">
            <Target className="h-4 w-4" />
            Set Targets
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average RTO</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">2h 8m</div>
            <div className="flex items-center gap-1 text-sm">
              <TrendingUp className="h-3 w-3 text-success" />
              <span className="text-success">32% better than target</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average RPO</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">28m</div>
            <div className="flex items-center gap-1 text-sm">
              <TrendingUp className="h-3 w-3 text-success" />
              <span className="text-success">53% better than target</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <div className="text-sm text-muted-foreground">Meeting both RTO & RPO</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">At-Risk Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-critical">22</div>
            <div className="text-sm text-muted-foreground">Exceeding targets</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="services" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="services">By Service</TabsTrigger>
          <TabsTrigger value="business-impact">Business Impact</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-6">
          {/* Service RTO/RPO Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Service RTO/RPO Performance</CardTitle>
              <CardDescription>Current performance vs targets by AWS service</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {rtoRpoData.map((service) => {
                  const rtoStatus = getComplianceStatus(service.rto, service.target_rto)
                  const rpoStatus = getComplianceStatus(service.rpo, service.target_rpo)

                  return (
                    <div key={service.service} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {service.service === "RDS" || service.service === "DynamoDB" ? (
                            <Database className="h-4 w-4" />
                          ) : (
                            <Server className="h-4 w-4" />
                          )}
                          <h3 className="font-medium">{service.service}</h3>
                          <Badge variant="outline">{service.resources} resources</Badge>
                          {service.critical > 0 && <Badge variant="critical">{service.critical} critical</Badge>}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>RTO (Recovery Time Objective)</span>
                            <span className={getStatusColor(rtoStatus)}>
                              {formatTime(service.rto)} / {formatTime(service.target_rto)}
                            </span>
                          </div>
                          <Progress value={Math.min((service.target_rto / service.rto) * 100, 100)} className="h-2" />
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>RPO (Recovery Point Objective)</span>
                            <span className={getStatusColor(rpoStatus)}>
                              {formatTime(service.rpo)} / {formatTime(service.target_rpo)}
                            </span>
                          </div>
                          <Progress value={Math.min((service.target_rpo / service.rpo) * 100, 100)} className="h-2" />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* RTO vs RPO Scatter Plot */}
          <Card>
            <CardHeader>
              <CardTitle>RTO vs RPO Performance Matrix</CardTitle>
              <CardDescription>Service positioning relative to recovery objectives</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart data={rtoRpoData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="rto"
                      name="RTO (minutes)"
                      label={{ value: "Recovery Time Objective (minutes)", position: "insideBottom", offset: -10 }}
                    />
                    <YAxis
                      dataKey="rpo"
                      name="RPO (minutes)"
                      label={{ value: "Recovery Point Objective (minutes)", angle: -90, position: "insideLeft" }}
                    />
                    <Tooltip
                      formatter={(value, name) => [formatTime(value as number), name === "rto" ? "RTO" : "RPO"]}
                      labelFormatter={(label) => `Service: ${label}`}
                    />
                    <Scatter dataKey="rpo" fill="hsl(var(--primary))" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business-impact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Impact Tier Analysis</CardTitle>
              <CardDescription>RTO/RPO performance by business criticality</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {businessImpactData.map((tier) => (
                  <div key={tier.tier} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium">{tier.tier} Tier</h3>
                        <Badge
                          variant={
                            tier.tier === "Critical" ? "critical" : tier.tier === "Important" ? "warning" : "secondary"
                          }
                        >
                          {tier.resources} resources
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Target: {formatTime(tier.rto_target)} RTO, {formatTime(tier.rpo_target)} RPO
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">RTO Performance</span>
                            <span
                              className={`text-sm font-mono ${
                                tier.current_rto <= tier.rto_target ? "text-success" : "text-critical"
                              }`}
                            >
                              {formatTime(tier.current_rto)}
                            </span>
                          </div>
                          <Progress value={Math.min((tier.rto_target / tier.current_rto) * 100, 100)} className="h-2" />
                          <div className="text-xs text-muted-foreground mt-1">
                            Target: {formatTime(tier.rto_target)}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">RPO Performance</span>
                            <span
                              className={`text-sm font-mono ${
                                tier.current_rpo <= tier.rpo_target ? "text-success" : "text-critical"
                              }`}
                            >
                              {formatTime(tier.current_rpo)}
                            </span>
                          </div>
                          <Progress value={Math.min((tier.rpo_target / tier.current_rpo) * 100, 100)} className="h-2" />
                          <div className="text-xs text-muted-foreground mt-1">
                            Target: {formatTime(tier.rpo_target)}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recovery Objective Compliance</CardTitle>
                <CardDescription>Distribution of resources by compliance status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={recoveryDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {recoveryDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>RTO/RPO Target Achievement</CardTitle>
                <CardDescription>Performance against defined objectives</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={rtoRpoData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="service" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatTime(value as number)} />
                      <Bar dataKey="rto" fill="hsl(var(--primary))" name="Current RTO" />
                      <Bar dataKey="target_rto" fill="hsl(var(--muted))" name="Target RTO" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>RTO/RPO Improvement Trends</CardTitle>
              <CardDescription>Historical performance vs targets over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatTime(value as number)} />
                    <Bar dataKey="avg_rto" fill="hsl(var(--primary))" name="Average RTO" />
                    <Bar dataKey="avg_rpo" fill="hsl(var(--secondary))" name="Average RPO" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Improvement Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Improvement Recommendations</CardTitle>
              <CardDescription>Actionable steps to optimize RTO/RPO performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    priority: "high",
                    service: "EC2",
                    recommendation: "Implement automated AMI creation for faster instance recovery",
                    impact: "Reduce RTO from 2h to 45m for critical instances",
                    effort: "Medium",
                  },
                  {
                    priority: "high",
                    service: "RDS",
                    recommendation: "Enable cross-region automated backups for production databases",
                    impact: "Improve RPO from 5m to 1m for critical data",
                    effort: "Low",
                  },
                  {
                    priority: "medium",
                    service: "S3",
                    recommendation: "Configure cross-region replication for critical buckets",
                    impact: "Reduce RPO from 1h to 15m for important data",
                    effort: "Low",
                  },
                  {
                    priority: "medium",
                    service: "EBS",
                    recommendation: "Optimize snapshot scheduling and lifecycle policies",
                    impact: "Improve RPO consistency across all volumes",
                    effort: "Medium",
                  },
                ].map((rec, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className={`p-2 rounded-full ${rec.priority === "high" ? "bg-critical/10" : "bg-warning/10"}`}>
                      <AlertTriangle
                        className={`h-4 w-4 ${rec.priority === "high" ? "text-critical" : "text-warning"}`}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">{rec.service}</Badge>
                        <Badge variant={rec.priority === "high" ? "critical" : "warning"}>
                          {rec.priority} priority
                        </Badge>
                      </div>
                      <h4 className="font-medium mb-1">{rec.recommendation}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{rec.impact}</p>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Effort: </span>
                        <span className="font-medium">{rec.effort}</span>
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
