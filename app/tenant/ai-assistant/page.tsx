"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScoreGauge } from "@/components/ui/score-gauge"
import {
  Bot,
  MessageSquare,
  Brain,
  Target,
  TrendingUp,
  Shield,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Zap,
  BarChart3,
} from "lucide-react"
import Link from "next/link"

export default function AIAssistantPage() {
  const complianceFrameworks = [
    { name: "ISO 27031", current: 78, target: 95, color: "bg-blue-500" },
    { name: "DORA", current: 65, target: 90, color: "bg-purple-500" },
    { name: "SOC 2 Type II", current: 85, target: 95, color: "bg-green-500" },
    { name: "NIST CSF", current: 72, target: 88, color: "bg-orange-500" },
  ]

  const recoveryInsights = [
    {
      category: "RTO Optimization",
      impact: "High",
      improvement: "+18 score",
      description: "Optimize Recovery Time Objectives for critical workloads",
      priority: "high",
    },
    {
      category: "Cross-Region Backup",
      impact: "High",
      improvement: "+12 score",
      description: "Enable automated backup replication across regions",
      priority: "high",
    },
    {
      category: "RPO Enhancement",
      impact: "Medium",
      improvement: "+8 score",
      description: "Improve Recovery Point Objectives through better scheduling",
      priority: "medium",
    },
    {
      category: "Monitoring & Alerting",
      impact: "Medium",
      improvement: "+15 score",
      description: "Enhanced monitoring for availability and recovery metrics",
      priority: "medium",
    },
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Recovery Copilot</h1>
          <p className="text-muted-foreground">
            AI-powered assistant for recovery posture optimization and compliance management
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="text-sm">
            <Brain className="h-4 w-4 mr-2" />
            AI Agent Active
          </Badge>
          <Link href="/tenant/ai-assistant/chat">
            <Button className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Start Chat
            </Button>
          </Link>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Recovery Score</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xl font-bold">74</span>
                  <Badge variant="secondary" className="text-xs">
                    +8 this week
                  </Badge>
                </div>
              </div>
              <ScoreGauge value={74} size={24} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg RTO</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xl font-bold">4.2h</span>
                  <Badge variant="outline" className="text-xs">
                    Target: 2h
                  </Badge>
                </div>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Compliance Rate</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xl font-bold">75%</span>
                  <Badge variant="secondary" className="text-xs">
                    +5% this month
                  </Badge>
                </div>
              </div>
              <Shield className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Critical Issues</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xl font-bold">12</span>
                  <Badge variant="destructive" className="text-xs">
                    Needs attention
                  </Badge>
                </div>
              </div>
              <AlertTriangle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compliance Framework Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Compliance Framework Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {complianceFrameworks.map((framework) => (
              <div key={framework.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{framework.name}</span>
                  <span className="text-muted-foreground">
                    {framework.current}% / {framework.target}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={framework.current} className="flex-1" />
                  <Badge variant="outline" className="text-xs">
                    +{framework.target - framework.current} needed
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* AI-Powered Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI-Powered Recovery Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recoveryInsights.map((insight, index) => (
              <div key={index} className="flex items-start justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm">{insight.category}</h4>
                    <Badge className={`text-xs ${getPriorityColor(insight.priority)}`}>{insight.priority}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{insight.description}</p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">Impact: {insight.impact}</span>
                    <Badge variant="secondary" className="text-xs">
                      {insight.improvement}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/tenant/ai-assistant/chat">
              <Button variant="outline" className="h-auto p-4 justify-start w-full bg-transparent">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <div className="text-left">
                    <h4 className="font-medium text-sm">Chat with Copilot</h4>
                    <p className="text-xs text-muted-foreground">Ask questions about recovery</p>
                  </div>
                </div>
              </Button>
            </Link>

            <Button variant="outline" className="h-auto p-4 justify-start bg-transparent">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <h4 className="font-medium text-sm">Analyze Posture</h4>
                  <p className="text-xs text-muted-foreground">Get comprehensive assessment</p>
                </div>
              </div>
            </Button>

            <Button variant="outline" className="h-auto p-4 justify-start bg-transparent">
              <div className="flex items-center gap-3">
                <Target className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <h4 className="font-medium text-sm">Optimize RTO/RPO</h4>
                  <p className="text-xs text-muted-foreground">Improve recovery objectives</p>
                </div>
              </div>
            </Button>

            <Button variant="outline" className="h-auto p-4 justify-start bg-transparent">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <h4 className="font-medium text-sm">Generate Report</h4>
                  <p className="text-xs text-muted-foreground">Create compliance report</p>
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Getting Started */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Getting Started with Recovery Copilot
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium">1. Start a Conversation</h3>
              <p className="text-sm text-muted-foreground">
                Ask about your recovery posture, compliance gaps, or optimization opportunities
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium">2. Get AI Insights</h3>
              <p className="text-sm text-muted-foreground">
                Receive intelligent analysis and actionable recommendations with impact estimates
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium">3. Track Progress</h3>
              <p className="text-sm text-muted-foreground">
                Monitor improvements in your recovery score and compliance ratings
              </p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link href="/tenant/ai-assistant/chat">
              <Button size="lg" className="gap-2">
                Start Your First Conversation
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
