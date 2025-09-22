"use client"

import { useState } from "react"
import Link from "next/link"
import {
  MessageSquare,
  TrendingUp,
  Shield,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Zap,
  Target,
  BarChart3,
  FileText,
  Settings,
  Brain,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScoreGauge } from "@/components/ui/score-gauge"

const complianceFrameworks = [
  { name: "ISO 27031", score: 85, status: "good", color: "success" },
  { name: "DORA", score: 72, status: "warning", color: "warning" },
  { name: "SOC 2", score: 91, status: "excellent", color: "success" },
  { name: "NIST", score: 78, status: "good", color: "info" },
]

const aiInsights = [
  {
    type: "critical",
    title: "Critical RDS Backup Gap",
    description: "3 production databases lack automated backups",
    impact: "High",
    action: "Configure automated backups",
    icon: AlertTriangle,
  },
  {
    type: "warning",
    title: "RTO Optimization Opportunity",
    description: "EC2 instances can reduce recovery time by 40%",
    impact: "Medium",
    action: "Implement multi-AZ deployment",
    icon: TrendingUp,
  },
  {
    type: "success",
    title: "Compliance Improvement",
    description: "SOC 2 score increased by 0 points this month",
    impact: "Low",
    action: "Maintain current practices",
    icon: CheckCircle,
  },
]

const quickActions = [
  { title: "Analyze Recovery Posture", icon: BarChart3, href: "/tenant/posture/scorecard" },
  { title: "Optimize RTO/RPO", icon: Target, href: "/tenant/posture/rto-rpo" },
  { title: "Generate Compliance Report", icon: FileText, href: "/tenant/reports" },
  { title: "Configure Alerts", icon: Settings, href: "/tenant/alerts" },
]

export default function RecoveryCopilotPage() {
  const [selectedFramework, setSelectedFramework] = useState("ISO 27031")

  return (
    <div className="space-y-8 animate-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text dark:text-text-dark">Recovery Copilot</h1>
          <p className="text-text-secondary dark:text-text-secondary-dark mt-2">
            AI-powered insights to optimize your recovery posture
          </p>
        </div>
        <Link href="/tenant/copilot/chat">
          <Button className="apple-button">
            <MessageSquare className="mr-2 h-4 w-4" />
            Start Chat
          </Button>
        </Link>
      </div>

      {/* Recovery Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="scale-in">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Recovery Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-text dark:text-text-dark">87%</div>
              <ScoreGauge value={87} size={40} />
            </div>
            <p className="text-xs text-success mt-2">+3% from last week</p>
          </CardContent>
        </Card>

        <Card className="scale-in">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Average RTO</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-text dark:text-text-dark">2.4h</div>
            <p className="text-xs text-warning mt-2">Target: 1.5h</p>
          </CardContent>
        </Card>

        <Card className="scale-in">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Backup Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-text dark:text-text-dark">94%</div>
            <p className="text-xs text-success mt-2">+2% this month</p>
          </CardContent>
        </Card>

        <Card className="scale-in">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-critical">3</div>
            <p className="text-xs text-text-secondary dark:text-text-secondary-dark mt-2">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Frameworks */}
      <Card className="slide-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Compliance Framework Status
          </CardTitle>
          <CardDescription>Track your recovery posture against industry standards</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {complianceFrameworks.map((framework) => (
              <div
                key={framework.name}
                className={`glass dark:glass-dark rounded-xl p-4 cursor-pointer transition-all duration-200 apple-hover ${
                  selectedFramework === framework.name ? "ring-2 ring-primary/50" : ""
                }`}
                onClick={() => setSelectedFramework(framework.name)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-text dark:text-text-dark">{framework.name}</h3>
                  <Badge variant={framework.color as any}>{framework.status}</Badge>
                </div>
                <div className="flex items-center gap-3">
                  <ScoreGauge value={framework.score} size={32} />
                  <div className="text-2xl font-bold text-text dark:text-text-dark">{framework.score}%</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card className="slide-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI-Powered Insights
          </CardTitle>
          <CardDescription>Personalized recommendations to improve your recovery posture</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {aiInsights.map((insight, index) => (
              <div key={index} className="glass dark:glass-dark rounded-xl p-4 apple-hover">
                <div className="flex items-start gap-4">
                  <div
                    className={`p-2 rounded-lg ${
                      insight.type === "critical"
                        ? "bg-critical/10"
                        : insight.type === "warning"
                          ? "bg-warning/10"
                          : "bg-success/10"
                    }`}
                  >
                    <insight.icon
                      className={`h-5 w-5 ${
                        insight.type === "critical"
                          ? "text-critical"
                          : insight.type === "warning"
                            ? "text-warning"
                            : "text-success"
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-text dark:text-text-dark">{insight.title}</h3>
                      <Badge variant={insight.type as any} className="text-xs">
                        {insight.impact} Impact
                      </Badge>
                    </div>
                    <p className="text-sm text-text-secondary dark:text-text-secondary-dark mb-3">
                      {insight.description}
                    </p>
                    <Button variant="outline" size="sm" className="apple-button bg-transparent">
                      <Zap className="mr-2 h-3 w-3" />
                      {insight.action}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="slide-in">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks to optimize your recovery strategy</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <div className="glass dark:glass-dark rounded-xl p-4 apple-hover cursor-pointer group">
                  <div className="flex items-center justify-between mb-2">
                    <action.icon className="h-6 w-6 text-primary" />
                    <ArrowRight className="h-4 w-4 text-text-secondary dark:text-text-secondary-dark group-hover:text-primary transition-colors" />
                  </div>
                  <h3 className="font-medium text-text dark:text-text-dark">{action.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
