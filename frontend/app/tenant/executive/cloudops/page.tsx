"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { DollarSign, Zap, TrendingUp, TrendingDown, Server, FileText, Calendar, Activity } from "lucide-react"
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from "recharts"

const costData = [
  { month: "Jan", aws: 45000, azure: 28000, gcp: 15000 },
  { month: "Feb", aws: 48000, azure: 30000, gcp: 16000 },
  { month: "Mar", aws: 52000, azure: 32000, gcp: 18000 },
  { month: "Apr", aws: 49000, azure: 29000, gcp: 17000 },
  { month: "May", aws: 51000, azure: 31000, gcp: 19000 },
  { month: "Jun", aws: 47000, azure: 28000, gcp: 16000 },
]

const performanceData = [
  { time: "00:00", cpu: 65, memory: 72, network: 45, storage: 58 },
  { time: "04:00", cpu: 45, memory: 68, network: 38, storage: 52 },
  { time: "08:00", cpu: 78, memory: 82, network: 65, storage: 71 },
  { time: "12:00", cpu: 85, memory: 88, network: 72, storage: 76 },
  { time: "16:00", cpu: 92, memory: 85, network: 68, storage: 73 },
  { time: "20:00", cpu: 75, memory: 78, network: 55, storage: 65 },
]

const serviceHealth = [
  { service: "EC2 Instances", status: "healthy", uptime: 99.9, incidents: 0 },
  { service: "RDS Databases", status: "healthy", uptime: 99.8, incidents: 1 },
  { service: "Lambda Functions", status: "healthy", uptime: 99.9, incidents: 0 },
  { service: "S3 Storage", status: "healthy", uptime: 100, incidents: 0 },
  { service: "CloudFront CDN", status: "warning", uptime: 99.5, incidents: 2 },
  { service: "Load Balancers", status: "healthy", uptime: 99.9, incidents: 0 },
]

const optimizationData = [
  { initiative: "Reserved Instances", savings: 125000, status: "active" },
  { initiative: "Right-sizing", savings: 85000, status: "active" },
  { initiative: "Spot Instances", savings: 65000, status: "active" },
  { initiative: "Storage Optimization", savings: 45000, status: "pending" },
  { initiative: "Auto-scaling", savings: 35000, status: "active" },
]

export default function CloudOpsDashboard() {
  const totalMonthlyCost =
    costData[costData.length - 1].aws + costData[costData.length - 1].azure + costData[costData.length - 1].gcp
  const totalSavings = optimizationData
    .filter((item) => item.status === "active")
    .reduce((sum, item) => sum + item.savings, 0)

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">CloudOps Dashboard</h1>
          <p className="text-muted-foreground">Cloud infrastructure monitoring and cost management</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 bg-transparent">
            <FileText className="h-4 w-4" />
            Cost Report
          </Button>
          <Button variant="outline" className="gap-2 bg-transparent">
            <Calendar className="h-4 w-4" />
            Schedule Review
          </Button>
        </div>
      </div>

      {/* Key Cloud Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass apple-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Cloud Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-apple-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-apple-green">${(totalMonthlyCost / 1000).toFixed(0)}K</div>
            <p className="text-xs text-muted-foreground">
              <TrendingDown className="inline h-3 w-3 mr-1 text-apple-green" />
              -8% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="glass apple-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Infrastructure Health</CardTitle>
            <Activity className="h-4 w-4 text-apple-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-apple-blue">99.8%</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1 text-apple-green" />
              Above SLA targets
            </p>
          </CardContent>
        </Card>

        <Card className="glass apple-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost Savings</CardTitle>
            <Zap className="h-4 w-4 text-apple-orange" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-apple-orange">${(totalSavings / 1000).toFixed(0)}K</div>
            <p className="text-xs text-muted-foreground">Annual optimization savings</p>
          </CardContent>
        </Card>

        <Card className="glass apple-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Automation Coverage</CardTitle>
            <Server className="h-4 w-4 text-apple-purple" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-apple-purple">89%</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1 text-apple-green" />
              +5% this quarter
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-elevated">
          <CardHeader>
            <CardTitle>Multi-Cloud Cost Trends</CardTitle>
            <CardDescription>Monthly spending across cloud providers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={costData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, ""]} />
                  <Legend />
                  <Area type="monotone" dataKey="aws" stackId="1" stroke="#FF9500" fill="#FF9500" name="AWS" />
                  <Area type="monotone" dataKey="azure" stackId="1" stroke="#007AFF" fill="#007AFF" name="Azure" />
                  <Area type="monotone" dataKey="gcp" stackId="1" stroke="#34C759" fill="#34C759" name="GCP" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-elevated">
          <CardHeader>
            <CardTitle>Infrastructure Performance</CardTitle>
            <CardDescription>Real-time resource utilization metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="cpu" stroke="#FF3B30" name="CPU %" />
                  <Line type="monotone" dataKey="memory" stroke="#007AFF" name="Memory %" />
                  <Line type="monotone" dataKey="network" stroke="#34C759" name="Network %" />
                  <Line type="monotone" dataKey="storage" stroke="#FF9500" name="Storage %" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service Health Status */}
      <Card className="glass-elevated">
        <CardHeader>
          <CardTitle>Service Health Status</CardTitle>
          <CardDescription>Current status of critical cloud services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {serviceHealth.map((service, index) => (
              <div key={index} className="p-4 rounded-lg border space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{service.service}</h3>
                  <Badge
                    variant={service.status === "healthy" ? "default" : "secondary"}
                    className={service.status === "healthy" ? "bg-apple-green" : "bg-apple-orange"}
                  >
                    {service.status}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uptime</span>
                    <span className="font-medium">{service.uptime}%</span>
                  </div>
                  <Progress value={service.uptime} className="h-2" />
                </div>
                <p className="text-xs text-muted-foreground">{service.incidents} incidents this month</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cost Optimization */}
      <Card className="glass-elevated">
        <CardHeader>
          <CardTitle>Cost Optimization Initiatives</CardTitle>
          <CardDescription>Active and planned cost-saving measures</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {optimizationData.map((initiative, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-3 w-3 rounded-full ${
                      initiative.status === "active" ? "bg-apple-green" : "bg-apple-orange"
                    }`}
                  />
                  <span className="font-medium">{initiative.initiative}</span>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={initiative.status === "active" ? "default" : "secondary"}>{initiative.status}</Badge>
                  <span className="text-lg font-bold text-apple-green">${(initiative.savings / 1000).toFixed(0)}K</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
