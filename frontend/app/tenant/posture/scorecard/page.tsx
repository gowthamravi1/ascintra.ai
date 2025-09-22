"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScoreGauge } from "@/components/ui/score-gauge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, TrendingDown, Shield, AlertTriangle, CheckCircle, Clock, Database, Server } from "lucide-react"

type ServiceScore = {
  service: string
  score: number
  protected: number
  total: number
  protection_rate: number
  avg_rto?: string | null
  avg_rpo?: string | null
  critical_issues?: number | null
}

type Framework = { name: string; compliance_percent: number; passed_controls: number; total_controls: number; rto: string; rpo: string }
type Issue = { service: string; title: string; description: string; count: number; rto: string; rpo: string }
type Metrics = { avg_rto: string; avg_rpo: string; protection_coverage: number; recovery_tests: number }

export default function PostureScorecardPage() {
  const [overall, setOverall] = useState({ recovery_score: 0, protected: 0, unprotected: 0, total: 0 })
  const [serviceScores, setServiceScores] = useState<ServiceScore[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/tenant/posture/scorecard", { cache: "no-store" })
        if (!res.ok) return
        const data = await res.json()
        setOverall(data?.overall || { recovery_score: 0, protected: 0, unprotected: 0, total: 0 })
        setServiceScores(Array.isArray(data?.services) ? data.services : [])
      } catch {}
    }
    load()
  }, [])
  // UI helper: show a small trend indicator beside service score.
  // This is visual only; trend is not computed yet.
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

  const [frameworks, setFrameworks] = useState<Framework[]>([])
  const [issues, setIssues] = useState<Issue[]>([])
  const [metrics, setMetrics] = useState<Metrics>({ avg_rto: "", avg_rpo: "", protection_coverage: 0, recovery_tests: 0 })
  
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/tenant/posture/scorecard", { cache: "no-store" })
        if (!res.ok) return
        const data = await res.json()
        setFrameworks(Array.isArray(data?.frameworks) ? data.frameworks : [])
        setIssues(Array.isArray(data?.issues) ? data.issues : [])
        setMetrics(data?.metrics || { avg_rto: "", avg_rpo: "", protection_coverage: 0, recovery_tests: 0 })
      } catch {}
    }
    load()
  }, [])

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
            <ScoreGauge value={overall.recovery_score} size={120} label="Recovery Score" />
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-success" />
                <span className="text-lg font-medium">+0 points from last assessment</span>
              </div>
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-success">{overall.protected}</div>
                  <div className="text-sm text-muted-foreground">Protected Resources</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-critical">{overall.unprotected}</div>
                  <div className="text-sm text-muted-foreground">Unprotected</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{overall.total}</div>
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
                    <div className="h-4 w-4" />
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
              {/* Formula (UI): protection_rate% = protected / total * 100 (rounded for display) */}
              <span className="font-medium">{Math.round(service.protection_rate)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Resources:</span>
              <span>{service.protected}/{service.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Avg RTO:</span>
              <span className="font-mono">{service.avg_rto ?? ""}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Avg RPO:</span>
              <span className="font-mono">{service.avg_rpo ?? ""}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Critical Issues:</span>
              <span className="font-medium">{service.critical_issues ?? ""}</span>
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
            {frameworks.map((framework) => (
              <div key={framework.name} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium">{framework.name}</h3>
                    <Badge variant={framework.compliance_percent >= 90 ? "success" : framework.compliance_percent >= 70 ? "warning" : "critical"}>
                      {Math.round(framework.compliance_percent)}% compliant
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>RTO: {framework.rto}</span>
                    <span>RPO: {framework.rpo}</span>
                    <span>
                      {framework.passed_controls}/{framework.total_controls} controls
                    </span>
                  </div>
                </div>
                <Progress value={framework.compliance_percent} className="h-2" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-success" />
                    <span>{framework.passed_controls} passed</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3 text-critical" />
                    <span>{Math.max(framework.total_controls - framework.passed_controls, 0)} failed</span>
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
            {issues.map((finding, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Badge variant="outline">{finding.service}</Badge>
                  <div className="flex-1">
                    <p className="font-medium">{finding.title}</p>
                    <p className="text-sm text-muted-foreground">{finding.description}</p>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <Badge variant="secondary">{finding.count} resources</Badge>
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
            {/* Blank if not available */}
            <div className="text-2xl font-bold font-mono">{metrics.avg_rto || ""}</div>
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
            {/* Blank if not available */}
            <div className="text-2xl font-bold font-mono">{metrics.avg_rpo || ""}</div>
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
            {/* Blank if not available */}
            <div className="text-2xl font-bold">{metrics.protection_coverage ? `${metrics.protection_coverage}%` : ""}</div>
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
            {/* Blank if not available */}
            <div className="text-2xl font-bold">{metrics.recovery_tests ? metrics.recovery_tests : ""}</div>
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
