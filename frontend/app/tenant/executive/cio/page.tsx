"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Monitor, DollarSign, Users, TrendingUp, BarChart3, FileText, Calendar } from "lucide-react"
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const performanceData = [
  { month: "Jan", uptime: 99.9, performance: 95, satisfaction: 4.2 },
  { month: "Feb", uptime: 99.8, performance: 96, satisfaction: 4.3 },
  { month: "Mar", uptime: 99.9, performance: 94, satisfaction: 4.1 },
  { month: "Apr", uptime: 99.7, performance: 97, satisfaction: 4.4 },
  { month: "May", uptime: 99.9, performance: 98, satisfaction: 4.5 },
  { month: "Jun", uptime: 99.8, performance: 96, satisfaction: 4.3 },
]

const resourceData = [
  { name: "Compute", value: 35, color: "#007AFF" },
  { name: "Storage", value: 25, color: "#34C759" },
  { name: "Network", value: 20, color: "#FF9500" },
  { name: "Database", value: 20, color: "#FF3B30" },
]

const budgetData = [
  { category: "Infrastructure", budget: 2400000, spent: 2100000, projected: 2350000 },
  { category: "Software Licenses", budget: 800000, spent: 720000, projected: 780000 },
  { category: "Security", budget: 600000, spent: 580000, projected: 590000 },
  { category: "Personnel", budget: 3200000, spent: 2800000, projected: 3100000 },
  { category: "Training", budget: 200000, spent: 150000, projected: 180000 },
]

const projectData = [
  { name: "Cloud Migration", progress: 75, status: "on-track", budget: 1200000, timeline: "Q3 2024" },
  { name: "Security Upgrade", progress: 90, status: "ahead", budget: 800000, timeline: "Q2 2024" },
  { name: "Digital Transformation", progress: 45, status: "at-risk", budget: 2000000, timeline: "Q4 2024" },
  { name: "Data Analytics Platform", progress: 60, status: "on-track", budget: 1500000, timeline: "Q3 2024" },
]

export default function CIODashboard() {
  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">CIO Dashboard</h1>
          <p className="text-muted-foreground">Technology strategy and IT performance overview</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 bg-transparent">
            <FileText className="h-4 w-4" />
            IT Report
          </Button>
          <Button variant="outline" className="gap-2 bg-transparent">
            <Calendar className="h-4 w-4" />
            Strategy Review
          </Button>
        </div>
      </div>

      {/* Key IT Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass apple-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Utilization</CardTitle>
            <DollarSign className="h-4 w-4 text-apple-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-apple-green">87%</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1 text-apple-green" />
              On track for fiscal year
            </p>
          </CardContent>
        </Card>

        <Card className="glass apple-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Monitor className="h-4 w-4 text-apple-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-apple-blue">99.8%</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1 text-apple-green" />
              Above SLA target
            </p>
          </CardContent>
        </Card>

        <Card className="glass apple-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Satisfaction</CardTitle>
            <Users className="h-4 w-4 text-apple-purple" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-apple-purple">4.3/5</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1 text-apple-green" />
              +0.2 from last quarter
            </p>
          </CardContent>
        </Card>

        <Card className="glass apple-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <BarChart3 className="h-4 w-4 text-apple-orange" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-apple-orange">12</div>
            <p className="text-xs text-muted-foreground">3 completing this quarter</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-elevated">
          <CardHeader>
            <CardTitle>IT Performance Trends</CardTitle>
            <CardDescription>Uptime, performance, and satisfaction over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="uptime" stroke="#007AFF" name="Uptime %" />
                  <Line type="monotone" dataKey="performance" stroke="#34C759" name="Performance %" />
                  <Line type="monotone" dataKey="satisfaction" stroke="#FF9500" name="Satisfaction (x20)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-elevated">
          <CardHeader>
            <CardTitle>Resource Utilization</CardTitle>
            <CardDescription>Current infrastructure resource allocation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={resourceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {resourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Overview */}
      <Card className="glass-elevated">
        <CardHeader>
          <CardTitle>Budget Overview</CardTitle>
          <CardDescription>Current spending vs budget by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {budgetData.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{item.category}</span>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">
                      ${(item.spent / 1000000).toFixed(1)}M / ${(item.budget / 1000000).toFixed(1)}M
                    </span>
                    <span className="font-medium">{Math.round((item.spent / item.budget) * 100)}%</span>
                  </div>
                </div>
                <Progress value={(item.spent / item.budget) * 100} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Projected: ${(item.projected / 1000000).toFixed(1)}M</span>
                  <span>{item.projected > item.budget ? "Over budget" : "Under budget"}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Strategic Projects */}
      <Card className="glass-elevated">
        <CardHeader>
          <CardTitle>Strategic IT Projects</CardTitle>
          <CardDescription>Major initiatives and their current status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projectData.map((project, index) => (
              <div key={index} className="p-4 rounded-lg border space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{project.name}</h3>
                  <Badge
                    variant={
                      project.status === "ahead"
                        ? "default"
                        : project.status === "on-track"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {project.status}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Budget: ${(project.budget / 1000000).toFixed(1)}M</span>
                  <span>Target: {project.timeline}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
