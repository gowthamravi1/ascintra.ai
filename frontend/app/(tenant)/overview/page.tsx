"use client"

import * as React from "react"
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Shield,
  TrendingUp,
  Zap,
  BarChart3,
  PieChart,
  Target,
  RefreshCw,
  Filter,
  Search,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ScoreGauge } from "@/components/ui/score-gauge"
import { HeatCell } from "@/components/ui/heat-cell"
import { Input } from "@/components/ui/input"

export default function TenantOverview() {
  const [refreshing, setRefreshing] = React.useState(false)

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 2000)
  }

  const kpiData = [
    {
      title: "Recovery Score",
      value: "87",
      change: "+5%",
      trend: "up",
      icon: Target,
      description: "Overall recovery readiness",
    },
    {
      title: "Protected Resources",
      value: "1,247",
      change: "+12%",
      trend: "up",
      icon: Shield,
      description: "Resources with backup coverage",
    },
    {
      title: "Critical Alerts",
      value: "3",
      change: "-2",
      trend: "down",
      icon: AlertTriangle,
      description: "Requiring immediate attention",
    },
    {
      title: "Avg RTO",
      value: "2.4h",
      change: "-15min",
      trend: "down",
      icon: Clock,
      description: "Recovery time objective",
    },
  ]

  const recentActivities = [
    {
      id: 1,
      type: "backup",
      message: "Daily backup completed for Production DB",
      timestamp: "2 minutes ago",
      status: "success",
    },
    {
      id: 2,
      type: "alert",
      message: "RTO threshold exceeded for Web Servers",
      timestamp: "15 minutes ago",
      status: "warning",
    },
    {
      id: 3,
      type: "recovery",
      message: "Recovery test completed successfully",
      timestamp: "1 hour ago",
      status: "success",
    },
    {
      id: 4,
      type: "discovery",
      message: "New resources discovered in us-west-2",
      timestamp: "2 hours ago",
      status: "info",
    },
  ]

  const quickActions = [
    {
      title: "Run Discovery",
      description: "Scan for new AWS resources",
      icon: Search,
      href: "/tenant/discovery/connect",
      color: "bg-blue-500",
    },
    {
      title: "Test Recovery",
      description: "Simulate disaster recovery",
      icon: RefreshCw,
      href: "/tenant/recovery-testing/simulator",
      color: "bg-green-500",
    },
    {
      title: "View Reports",
      description: "Generate compliance reports",
      icon: BarChart3,
      href: "/tenant/reports",
      color: "bg-purple-500",
    },
    {
      title: "Configure Alerts",
      description: "Set up monitoring alerts",
      icon: AlertTriangle,
      href: "/tenant/alerts",
      color: "bg-orange-500",
    },
  ]

  const regionalData = [
    { region: "us-east-1", score: 92, resources: 456 },
    { region: "us-west-2", score: 87, resources: 324 },
    { region: "eu-west-1", score: 78, resources: 267 },
    { region: "ap-south-1", score: 65, resources: 200 },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Recovery Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Monitor your disaster recovery posture and backup coverage across all AWS resources
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search resources..."
              className="pl-10 w-64 bg-white/80 backdrop-blur-sm border-white/20"
            />
          </div>
          <Button variant="outline" size="icon" className="bg-white/80 backdrop-blur-sm border-white/20">
            <Filter className="h-4 w-4" />
          </Button>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi) => (
          <Card
            key={kpi.title}
            className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{kpi.title}</CardTitle>
              <kpi.icon className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{kpi.value}</div>
              <div className="flex items-center space-x-2 text-xs text-gray-600">
                <span className={`flex items-center ${kpi.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                  <TrendingUp className={`h-3 w-3 mr-1 ${kpi.trend === "down" ? "rotate-180" : ""}`} />
                  {kpi.change}
                </span>
                <span>from last week</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{kpi.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recovery Score Gauge */}
        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Recovery Posture Score
            </CardTitle>
            <CardDescription>
              Overall readiness based on backup coverage, RTO/RPO compliance, and testing frequency
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <ScoreGauge score={87} size="lg" />
            <div className="text-center space-y-2">
              <div className="text-sm text-gray-600">
                <span className="font-medium text-green-600">Good</span> - Above industry average
              </div>
              <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                <span>Target: 90+</span>
                <span>•</span>
                <span>Industry Avg: 72</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Regional Recovery Health */}
        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-purple-600" />
              Regional Recovery Health
            </CardTitle>
            <CardDescription>Recovery readiness score by AWS region</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {regionalData.map((region) => (
                <div key={region.region} className="text-center space-y-2">
                  <HeatCell
                    value={region.score}
                    label={region.region}
                    size="lg"
                    onClick={() => console.log(`Navigate to ${region.region}`)}
                  />
                  <div className="text-xs text-gray-600">
                    <div className="font-medium">{region.region}</div>
                    <div>{region.resources} resources</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              Quick Actions
            </CardTitle>
            <CardDescription>Common tasks and operations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action) => (
              <Button
                key={action.title}
                variant="ghost"
                className="w-full justify-start h-auto p-3 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100"
                asChild
              >
                <a href={action.href}>
                  <div className={`w-8 h-8 rounded-lg ${action.color} flex items-center justify-center mr-3`}>
                    <action.icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900">{action.title}</div>
                    <div className="text-xs text-gray-500">{action.description}</div>
                  </div>
                </a>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Backup Coverage Overview */}
        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-green-600" />
              Backup Coverage Overview
            </CardTitle>
            <CardDescription>Protection status across AWS services</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { service: "EC2 Instances", protected: 89, total: 102, percentage: 87 },
              { service: "RDS Databases", protected: 24, total: 26, percentage: 92 },
              { service: "EBS Volumes", protected: 156, total: 178, percentage: 88 },
              { service: "S3 Buckets", protected: 45, total: 52, percentage: 87 },
            ].map((item) => (
              <div key={item.service} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">{item.service}</span>
                  <span className="text-gray-500">
                    {item.protected}/{item.total}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Progress value={item.percentage} className="flex-1" />
                  <span className="text-sm font-medium text-gray-900 w-12">{item.percentage}%</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest backup and recovery events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div
                    className={`w-2 h-2 rounded-full mt-2 ${
                      activity.status === "success"
                        ? "bg-green-500"
                        : activity.status === "warning"
                          ? "bg-yellow-500"
                          : activity.status === "error"
                            ? "bg-red-500"
                            : "bg-blue-500"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.timestamp}</p>
                  </div>
                  <Badge
                    variant={
                      activity.status === "success"
                        ? "default"
                        : activity.status === "warning"
                          ? "secondary"
                          : "outline"
                    }
                    className="text-xs"
                  >
                    {activity.status}
                  </Badge>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <Button variant="ghost" className="w-full text-sm text-gray-600 hover:text-gray-900">
                View all activities
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Status */}
      <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Compliance Status
          </CardTitle>
          <CardDescription>Current status against compliance frameworks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { framework: "ISO 27031", score: 87, status: "Compliant", color: "green" },
              { framework: "SOC 2 Type II", score: 92, status: "Compliant", color: "green" },
              { framework: "NIST CSF", score: 78, status: "Partial", color: "yellow" },
            ].map((compliance) => (
              <div key={compliance.framework} className="text-center space-y-3">
                <div className="text-lg font-semibold text-gray-900">{compliance.framework}</div>
                <ScoreGauge score={compliance.score} size="md" />
                <Badge
                  variant={compliance.color === "green" ? "default" : "secondary"}
                  className={`${
                    compliance.color === "green" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {compliance.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
