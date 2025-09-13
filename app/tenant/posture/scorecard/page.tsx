"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScoreGauge } from "@/components/ui/score-gauge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, TrendingDown, Shield, AlertTriangle, CheckCircle, Clock, Database, Server } from "lucide-react"

const serviceScores = [
  {
    service: "EC2",
    score: 85,
    trend: "up",
    protectedCount: 42,
    total: 45,
    avgRto: "2h",
    avgRpo: "15m",
    criticalIssues: 2,
  },
  {
    service: "RDS",
    score: 92,
    trend: "up",
    protectedCount: 11,
    total: 12,
    avgRto: "1h",
    avgRpo: "5m",
    criticalIssues: 0,
  },
  {
    service: "S3",
    score: 78,
    trend: "down",
    protectedCount: 18,
    total: 23,
    avgRto: "30m",
    avgRpo: "1h",
    criticalIssues: 3,
  },
  {
    service: "EBS",
    score: 88,
    trend: "stable",
    protectedCount: 156,
    total: 178,
    avgRto: "45m",
    avgRpo: "4h",
    criticalIssues: 1,
  },
  {
    service: "Lambda",
    score: 94,
    trend: "up",
    protectedCount: 64,
    total: 67,
    avgRto: "5m",
    avgRpo: "0m",
    criticalIssues: 0,
  },
  {
    service: "DynamoDB",
    score: 89,
    trend: "up",
    protectedCount: 7,
    total: 8,
    avgRto: "15m",
    avgRpo: "1m",
    criticalIssues: 0,
  },
]

const recoveryFrameworks = [
  { name: "Disaster Recovery", score: 87, controls: 24, passed: 21, failed: 3, rto: "4h", rpo: "1h" },
  { name: "Business Continuity", score: 82, controls: 18, passed: 15, failed: 3, rto: "2h", rpo: "30m" },
  { name: "Data Protection", score: 91, controls: 32, passed: 29, failed: 3, rto: "1h", rpo: "15m" },
  { name: "Operational Resilience", score: 85, controls: 28, passed: 24, failed: 4, rto: "6h", rpo: "2h" },
]

const criticalFindings = [
  {
    service: "EC2",
    finding: "Production instances without backup policies",
    severity: "critical",
    count: 8,
    impact: "Data loss risk during failures",
    rto: "Unknown",
    rpo: "Unknown",
  },
  {
    service: "S3",
    finding: "Cross-region replication not configured",
    severity: "high",
    count: 5,
    impact: "Regional failure vulnerability",
    rto: "24h+",
    rpo: "24h+",
  },
  {
    service: "RDS",
    finding: "Automated backups disabled",
    severity: "critical",
    count: 2,
    impact: "Database recovery impossible",
    rto: "Unknown",
    rpo: "Unknown",
  },
  {
    service: "EBS",
    finding: "Snapshot lifecycle policies missing",
    severity: "medium",
    count: 12,
    impact: "Inconsistent backup retention",
    rto: "Variable",
    rpo: "Variable",
  },
]

export default function PostureScorecardPage() {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-success" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-critical" />
      default:
        return <div className="h-4 w-4" />
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-success"
    if (score >= 70) return "text-warning"
    return "text-critical"
  }

  const getProtectionRate = (protectedCount: number, total: number) => {
    return Math.round((protectedCount / total) * 100)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Recovery Posture Scorecard</h1>
          <p className="text-muted-foreground">Comprehensive recovery readiness assessment across all services</p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="current">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Current Period</SelectItem>
              <SelectItem value="last-week">Last Week</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2 bg-transparent">
            <Shield className="h-4 w-4" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Overall Recovery Score */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Recovery Posture</CardTitle>
          <CardDescription>Aggregate recovery readiness across all AWS services and resources</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-8">
            <ScoreGauge value={87} size={120} label="Recovery Score" />
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-success" />
                <span className="text-lg font-medium">+8 points from last assessment</span>
              </div>
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-success">298</div>
                  <div className="text-sm text-muted-foreground">Protected Resources</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-critical">35</div>
                  <div className="text-sm text-muted-foreground">Unprotected</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">333</div>
                  <div className="text-sm text-muted-foreground">Total Resources</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Recovery Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Service Recovery Breakdown</CardTitle>
          <CardDescription>Recovery readiness scores and metrics by AWS service</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {serviceScores.map((service) => (
              <Card key={service.service}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {service.service === "RDS" ? <Database className="h-4 w-4" /> : <Server className="h-4 w-4" />}
                      <h3 className="font-medium">{service.service}</h3>
                    </div>
                    {getTrendIcon(service.trend)}
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <ScoreGauge value={service.score} size={40} showValue={false} />
                    <div>
                      <div className={`text-xl font-bold ${getScoreColor(service.score)}`}>{service.score}</div>
                      <div className="text-xs text-muted-foreground">Recovery Score</div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Protection Rate:</span>
                      <span className="font-medium">{getProtectionRate(service.protectedCount, service.total)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Resources:</span>
                      <span>
                        {service.protectedCount}/{service.total}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avg RTO:</span>
                      <span className="font-mono">{service.avgRto}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avg RPO:</span>
                      <span className="font-mono">{service.avgRpo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Critical Issues:</span>
                      <span className={service.criticalIssues > 0 ? "text-critical font-medium" : "text-success"}>
                        {service.criticalIssues}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recovery Framework Compliance */}
      <Card>
        <CardHeader>
          <CardTitle>Recovery Framework Compliance</CardTitle>
          <CardDescription>Compliance with disaster recovery and business continuity frameworks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {recoveryFrameworks.map((framework) => (
              <div key={framework.name} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium">{framework.name}</h3>
                    <Badge variant={framework.score >= 90 ? "success" : framework.score >= 70 ? "warning" : "critical"}>
                      {framework.score}% compliant
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>RTO: {framework.rto}</span>
                    <span>RPO: {framework.rpo}</span>
                    <span>
                      {framework.passed}/{framework.controls} controls
                    </span>
                  </div>
                </div>
                <Progress value={framework.score} className="h-2" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-success" />
                    <span>{framework.passed} passed</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3 text-critical" />
                    <span>{framework.failed} failed</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Critical Recovery Issues */}
      <Card>
        <CardHeader>
          <CardTitle>Critical Recovery Issues</CardTitle>
          <CardDescription>High-priority findings that impact recovery capabilities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {criticalFindings.map((finding, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Badge variant="outline">{finding.service}</Badge>
                  <div className="flex-1">
                    <p className="font-medium">{finding.finding}</p>
                    <p className="text-sm text-muted-foreground">{finding.impact}</p>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <Badge
                    variant={
                      finding.severity === "critical"
                        ? "critical"
                        : finding.severity === "high"
                          ? "critical"
                          : "warning"
                    }
                  >
                    {finding.count} resources
                  </Badge>
                  <div className="text-xs text-muted-foreground">
                    RTO: {finding.rto} | RPO: {finding.rpo}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recovery Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average RTO</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">2.5h</div>
            <div className="flex items-center gap-1 text-sm">
              <TrendingDown className="h-3 w-3 text-success" />
              <span className="text-success">-30m from target</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average RPO</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">45m</div>
            <div className="flex items-center gap-1 text-sm">
              <TrendingDown className="h-3 w-3 text-success" />
              <span className="text-success">-15m from target</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Protection Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89.5%</div>
            <div className="flex items-center gap-1 text-sm">
              <TrendingUp className="h-3 w-3 text-success" />
              <span className="text-success">+5.2% this month</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Recovery Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <div className="flex items-center gap-1 text-sm">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">Last 30 days</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
