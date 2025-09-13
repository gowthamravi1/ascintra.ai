"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScoreGauge } from "@/components/ui/score-gauge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Shield, AlertTriangle, CheckCircle } from "lucide-react"

const serviceScores = [
  { service: "EC2", score: 92, trend: "up", findings: 12, resources: 45 },
  { service: "S3", score: 78, trend: "down", findings: 8, resources: 23 },
  { service: "RDS", score: 85, trend: "up", findings: 5, resources: 12 },
  { service: "Lambda", score: 94, trend: "up", findings: 2, resources: 67 },
  { service: "VPC", score: 88, trend: "stable", findings: 6, resources: 8 },
  { service: "IAM", score: 72, trend: "down", findings: 15, resources: 156 },
  { service: "CloudTrail", score: 96, trend: "up", findings: 1, resources: 3 },
  { service: "KMS", score: 89, trend: "stable", findings: 3, resources: 18 },
]

const complianceFrameworks = [
  { name: "SOC 2", score: 87, controls: 64, passed: 56, failed: 8 },
  { name: "ISO 27001", score: 82, controls: 114, passed: 94, failed: 20 },
  { name: "PCI DSS", score: 91, controls: 78, passed: 71, failed: 7 },
  { name: "NIST", score: 85, controls: 98, passed: 83, failed: 15 },
]

export default function ServiceScorecardPage() {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Service Scorecard</h1>
          <p className="text-muted-foreground">Security posture breakdown by AWS service</p>
        </div>
        <Button variant="outline" className="gap-2 bg-transparent">
          <Shield className="h-4 w-4" />
          Generate Report
        </Button>
      </div>

      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Security Posture</CardTitle>
          <CardDescription>Aggregate score across all AWS services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-8">
            <ScoreGauge value={87} size={120} label="Overall Score" />
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-success" />
                <span className="text-lg font-medium">+5 points from last scan</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-success">156</div>
                  <div className="text-sm text-muted-foreground">Passed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-critical">52</div>
                  <div className="text-sm text-muted-foreground">Failed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">334</div>
                  <div className="text-sm text-muted-foreground">Total Resources</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Service Breakdown</CardTitle>
          <CardDescription>Security scores by AWS service</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {serviceScores.map((service) => (
              <Card key={service.service}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{service.service}</h3>
                    {getTrendIcon(service.trend)}
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <ScoreGauge value={service.score} size={40} showValue={false} />
                    <div>
                      <div className={`text-xl font-bold ${getScoreColor(service.score)}`}>{service.score}</div>
                      <div className="text-xs text-muted-foreground">Score</div>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Resources:</span>
                      <span>{service.resources}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Findings:</span>
                      <span className={service.findings > 0 ? "text-critical" : "text-success"}>
                        {service.findings}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Compliance Frameworks */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Framework Scores</CardTitle>
          <CardDescription>Security posture against industry standards</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {complianceFrameworks.map((framework) => (
              <div key={framework.name} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium">{framework.name}</h3>
                    <Badge variant={framework.score >= 90 ? "success" : framework.score >= 70 ? "warning" : "critical"}>
                      {framework.score}% compliant
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {framework.passed}/{framework.controls} controls passed
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

      {/* Top Issues */}
      <Card>
        <CardHeader>
          <CardTitle>Top Security Issues</CardTitle>
          <CardDescription>Most critical findings requiring attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                service: "IAM",
                issue: "Overprivileged IAM roles detected",
                severity: "critical",
                count: 8,
                impact: "High privilege escalation risk",
              },
              {
                service: "S3",
                issue: "Public read access on sensitive buckets",
                severity: "high",
                count: 3,
                impact: "Data exposure risk",
              },
              {
                service: "EC2",
                issue: "Security groups with unrestricted access",
                severity: "high",
                count: 5,
                impact: "Network security risk",
              },
              {
                service: "RDS",
                issue: "Database instances without encryption",
                severity: "medium",
                count: 2,
                impact: "Data at rest vulnerability",
              },
            ].map((issue, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Badge variant="outline">{issue.service}</Badge>
                  <div>
                    <p className="font-medium">{issue.issue}</p>
                    <p className="text-sm text-muted-foreground">{issue.impact}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge
                    variant={
                      issue.severity === "critical" ? "critical" : issue.severity === "high" ? "critical" : "warning"
                    }
                  >
                    {issue.count} instances
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
