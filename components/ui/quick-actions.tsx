"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Shield, Clock, Target, TrendingUp, AlertCircle, CheckCircle2, Zap } from "lucide-react"

interface QuickActionsProps {
  onActionClick: (action: string) => void
}

const quickActions = [
  {
    id: "analyze-posture",
    title: "Analyze Current Posture",
    description: "Get comprehensive recovery posture assessment",
    icon: BarChart3,
    category: "Analysis",
    priority: "high",
  },
  {
    id: "compliance-gaps",
    title: "Identify Compliance Gaps",
    description: "Find gaps in ISO, DORA, SOC2 compliance",
    icon: Shield,
    category: "Compliance",
    priority: "high",
  },
  {
    id: "optimize-rto",
    title: "Optimize RTO Performance",
    description: "Improve Recovery Time Objectives",
    icon: Clock,
    category: "Performance",
    priority: "medium",
  },
  {
    id: "optimize-rpo",
    title: "Optimize RPO Targets",
    description: "Enhance Recovery Point Objectives",
    icon: Target,
    category: "Performance",
    priority: "medium",
  },
  {
    id: "trend-analysis",
    title: "Recovery Trends Analysis",
    description: "Analyze recovery performance trends",
    icon: TrendingUp,
    category: "Analytics",
    priority: "low",
  },
  {
    id: "critical-issues",
    title: "Critical Issues Review",
    description: "Address high-priority recovery issues",
    icon: AlertCircle,
    category: "Issues",
    priority: "high",
  },
  {
    id: "test-validation",
    title: "Validate Recovery Tests",
    description: "Review and validate recovery test results",
    icon: CheckCircle2,
    category: "Testing",
    priority: "medium",
  },
  {
    id: "quick-wins",
    title: "Quick Wins Recommendations",
    description: "Get easy-to-implement improvements",
    icon: Zap,
    category: "Optimization",
    priority: "medium",
  },
]

export function QuickActions({ onActionClick }: QuickActionsProps) {
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
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Button
                key={action.id}
                variant="outline"
                className="h-auto p-4 justify-start text-left bg-transparent"
                onClick={() => onActionClick(action.id)}
              >
                <div className="flex items-start gap-3 w-full">
                  <Icon className="h-5 w-5 mt-0.5 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{action.title}</h4>
                      <Badge className={`text-xs ${getPriorityColor(action.priority)}`}>{action.priority}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                    <p className="text-xs text-primary mt-1">{action.category}</p>
                  </div>
                </div>
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
