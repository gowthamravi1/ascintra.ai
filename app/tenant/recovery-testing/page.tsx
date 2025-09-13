"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Play,
  BarChart3,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Database,
  Server,
  Cloud,
  Shield,
  Zap,
  TrendingUp,
  Calendar,
  FileText,
} from "lucide-react"
import Link from "next/link"

export default function RecoveryTestingPage() {
  const testingMetrics = [
    {
      title: "Total Tests Today",
      value: "24",
      change: "+12%",
      icon: Play,
      color: "text-blue-500",
    },
    {
      title: "Success Rate",
      value: "92%",
      change: "+5%",
      icon: CheckCircle2,
      color: "text-green-500",
    },
    {
      title: "Avg Recovery Time",
      value: "3.2m",
      change: "-18s",
      icon: Clock,
      color: "text-orange-500",
    },
    {
      title: "Critical Issues",
      value: "3",
      change: "-2",
      icon: AlertTriangle,
      color: "text-red-500",
    },
  ]

  const testingWorkflows = [
    {
      title: "EC2 Instance Recovery",
      description: "Test EC2 instance backup and restore procedures",
      icon: Server,
      features: ["AMI-based recovery", "Cross-region restore", "Data validation", "Performance testing"],
      testsRun: 156,
      successRate: 94,
      avgRTO: "2.1m",
    },
    {
      title: "Database Recovery",
      description: "Validate RDS and database recovery processes",
      icon: Database,
      features: ["Point-in-time recovery", "Cross-AZ failover", "Data integrity checks", "Connection testing"],
      testsRun: 89,
      successRate: 97,
      avgRTO: "4.3m",
    },
    {
      title: "Application Stack Recovery",
      description: "End-to-end application recovery testing",
      icon: Cloud,
      features: ["Multi-tier recovery", "Load balancer config", "Auto-scaling setup", "Health checks"],
      testsRun: 67,
      successRate: 88,
      avgRTO: "8.7m",
    },
    {
      title: "Disaster Recovery Simulation",
      description: "Full-scale disaster recovery testing",
      icon: Shield,
      features: ["Region failover", "DNS switching", "Data replication", "Business continuity"],
      testsRun: 23,
      successRate: 91,
      avgRTO: "15.2m",
    },
  ]

  const serviceHealth = [
    { service: "EC2", coverage: 95, tests: 156, lastTest: "2 hours ago", status: "healthy" },
    { service: "RDS", coverage: 92, tests: 89, lastTest: "4 hours ago", status: "healthy" },
    { service: "S3", coverage: 88, tests: 234, lastTest: "1 hour ago", status: "warning" },
    { service: "Lambda", coverage: 85, tests: 67, lastTest: "6 hours ago", status: "healthy" },
    { service: "ELB", coverage: 90, tests: 45, lastTest: "3 hours ago", status: "healthy" },
    { service: "CloudFront", coverage: 78, tests: 34, lastTest: "8 hours ago", status: "warning" },
  ]

  const recentTests = [
    {
      id: "test-001",
      type: "EC2 Recovery",
      instance: "i-0123456789abcdef0",
      status: "success",
      rto: "1.8m",
      rpo: "5m",
      timestamp: "2024-01-09 14:30:00",
    },
    {
      id: "test-002",
      type: "RDS Failover",
      instance: "prod-db-cluster",
      status: "success",
      rto: "3.2m",
      rpo: "2m",
      timestamp: "2024-01-09 13:45:00",
    },
    {
      id: "test-003",
      type: "App Stack Recovery",
      instance: "web-app-prod",
      status: "failed",
      rto: "12.1m",
      rpo: "15m",
      timestamp: "2024-01-09 12:15:00",
    },
    {
      id: "test-004",
      type: "S3 Restore",
      instance: "backup-bucket-prod",
      status: "success",
      rto: "0.9m",
      rpo: "1m",
      timestamp: "2024-01-09 11:30:00",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
      case "warning":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
      case "healthy":
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
          <h1 className="text-2xl font-bold">Recovery Testing Center</h1>
          <p className="text-muted-foreground">
            Comprehensive recovery testing and validation for your AWS infrastructure
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/tenant/recovery-testing/simulator">
            <Button className="gap-2">
              <Play className="h-4 w-4" />
              New Simulation
            </Button>
          </Link>
          <Link href="/tenant/recovery-testing/dashboard">
            <Button variant="outline" className="gap-2 bg-transparent">
              <BarChart3 className="h-4 w-4" />
              View Dashboard
            </Button>
          </Link>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {testingMetrics.map((metric) => {
          const Icon = metric.icon
          return (
            <Card key={metric.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-2xl font-bold">{metric.value}</span>
                      <Badge variant="secondary" className="text-xs">
                        {metric.change}
                      </Badge>
                    </div>
                  </div>
                  <Icon className={`h-8 w-8 ${metric.color}`} />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Testing Workflows */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Recovery Testing Workflows
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testingWorkflows.map((workflow) => {
              const Icon = workflow.icon
              return (
                <div key={workflow.title} className="border rounded-lg p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{workflow.title}</h3>
                      <p className="text-sm text-muted-foreground">{workflow.description}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Key Features:</h4>
                    <div className="grid grid-cols-2 gap-1">
                      {workflow.features.map((feature) => (
                        <div key={feature} className="flex items-center gap-2 text-xs">
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{workflow.testsRun} tests</span>
                      <span>{workflow.successRate}% success</span>
                      <span>{workflow.avgRTO} avg RTO</span>
                    </div>
                    <Link href="/tenant/recovery-testing/simulator">
                      <Button size="sm" variant="outline">
                        Start Test
                      </Button>
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Service Health Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Service Recovery Coverage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {serviceHealth.map((service) => (
              <div key={service.service} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{service.service}</span>
                    <Badge className={`text-xs ${getStatusColor(service.status)}`}>{service.status}</Badge>
                  </div>
                  <span className="text-muted-foreground">{service.coverage}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={service.coverage} className="flex-1" />
                  <span className="text-xs text-muted-foreground">{service.tests} tests</span>
                </div>
                <p className="text-xs text-muted-foreground">Last test: {service.lastTest}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Test Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Test Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTests.map((test) => (
                <div key={test.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{test.type}</h4>
                      <Badge className={`text-xs ${getStatusColor(test.status)}`}>{test.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{test.instance}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>RTO: {test.rto}</span>
                      <span>RPO: {test.rpo}</span>
                      <span>{test.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/tenant/recovery-testing/simulator">
              <Button variant="outline" className="h-auto p-4 justify-start w-full bg-transparent">
                <div className="flex items-center gap-3">
                  <Play className="h-5 w-5 text-primary" />
                  <div className="text-left">
                    <h4 className="font-medium text-sm">Start Recovery Test</h4>
                    <p className="text-xs text-muted-foreground">Launch new simulation</p>
                  </div>
                </div>
              </Button>
            </Link>

            <Link href="/tenant/recovery-testing/dashboard">
              <Button variant="outline" className="h-auto p-4 justify-start w-full bg-transparent">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <div className="text-left">
                    <h4 className="font-medium text-sm">View Dashboard</h4>
                    <p className="text-xs text-muted-foreground">Detailed analytics</p>
                  </div>
                </div>
              </Button>
            </Link>

            <Button variant="outline" className="h-auto p-4 justify-start bg-transparent">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <h4 className="font-medium text-sm">Schedule Tests</h4>
                  <p className="text-xs text-muted-foreground">Automated testing</p>
                </div>
              </div>
            </Button>

            <Button variant="outline" className="h-auto p-4 justify-start bg-transparent">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <h4 className="font-medium text-sm">Generate Report</h4>
                  <p className="text-xs text-muted-foreground">Testing summary</p>
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
