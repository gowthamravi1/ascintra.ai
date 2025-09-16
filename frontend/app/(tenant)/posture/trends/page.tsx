"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts"
import { TrendingUp, TrendingDown, Calendar } from "lucide-react"

const scoreHistory = [
  { date: "2024-01-01", score: 78, findings: 65 },
  { date: "2024-01-08", score: 82, findings: 58 },
  { date: "2024-01-15", score: 85, findings: 52 },
  { date: "2024-01-22", score: 83, findings: 55 },
  { date: "2024-01-29", score: 87, findings: 48 },
  { date: "2024-02-05", score: 89, findings: 45 },
  { date: "2024-02-12", score: 87, findings: 52 },
]

const serviceHistory = [
  { date: "2024-01-01", EC2: 85, S3: 72, RDS: 88, Lambda: 92, IAM: 68 },
  { date: "2024-01-08", EC2: 87, S3: 75, RDS: 89, Lambda: 93, IAM: 70 },
  { date: "2024-01-15", EC2: 89, S3: 78, RDS: 87, Lambda: 94, IAM: 72 },
  { date: "2024-01-22", EC2: 91, S3: 76, RDS: 85, Lambda: 95, IAM: 71 },
  { date: "2024-01-29", EC2: 92, S3: 78, RDS: 85, Lambda: 94, IAM: 72 },
]

const findingsByCategory = [
  { category: "Access Control", count: 15, trend: "down" },
  { category: "Data Protection", count: 12, trend: "up" },
  { category: "Network Security", count: 8, trend: "down" },
  { category: "Logging & Monitoring", count: 6, trend: "stable" },
  { category: "Encryption", count: 4, trend: "down" },
]

export default function PostureTrendsPage() {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Posture Trends</h1>
          <p className="text-muted-foreground">Track your security posture over time</p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="30d">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2 bg-transparent">
            <Calendar className="h-4 w-4" />
            Custom Range
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Current Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87</div>
            <div className="flex items-center gap-1 text-sm">
              <TrendingUp className="h-3 w-3 text-success" />
              <span className="text-success">+9 from last month</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Findings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">52</div>
            <div className="flex items-center gap-1 text-sm">
              <TrendingDown className="h-3 w-3 text-success" />
              <span className="text-success">-13 from last month</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Best Performing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Lambda</div>
            <div className="text-sm text-muted-foreground">Score: 94</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Needs Attention</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">IAM</div>
            <div className="text-sm text-muted-foreground">Score: 72</div>
          </CardContent>
        </Card>
      </div>

      {/* Score Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Security Score Trend</CardTitle>
          <CardDescription>Overall security posture over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={scoreHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Service Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Service Score Trends</CardTitle>
            <CardDescription>Individual service performance over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={serviceHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[60, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="EC2" stroke="#8884d8" strokeWidth={2} />
                  <Line type="monotone" dataKey="S3" stroke="#82ca9d" strokeWidth={2} />
                  <Line type="monotone" dataKey="RDS" stroke="#ffc658" strokeWidth={2} />
                  <Line type="monotone" dataKey="Lambda" stroke="#ff7300" strokeWidth={2} />
                  <Line type="monotone" dataKey="IAM" stroke="#8dd1e1" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Findings by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Findings by Category</CardTitle>
            <CardDescription>Security issues breakdown by type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={findingsByCategory} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="category" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trend Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Trend Analysis</CardTitle>
          <CardDescription>Key insights from your security posture trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                type: "improvement",
                title: "Overall security score improved by 12% this month",
                description: "Significant progress in IAM and network security configurations",
                impact: "Reduced overall risk exposure",
              },
              {
                type: "concern",
                title: "Data protection findings increased by 15%",
                description: "New S3 buckets created without proper encryption settings",
                impact: "Potential compliance violations",
              },
              {
                type: "achievement",
                title: "Lambda service maintains 94+ score consistently",
                description: "Excellent security practices in serverless deployments",
                impact: "Best practice benchmark for other services",
              },
            ].map((insight, index) => (
              <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                <div
                  className={`p-2 rounded-full ${
                    insight.type === "improvement"
                      ? "bg-success/10"
                      : insight.type === "concern"
                        ? "bg-critical/10"
                        : "bg-accent/10"
                  }`}
                >
                  {insight.type === "improvement" ? (
                    <TrendingUp className="h-4 w-4 text-success" />
                  ) : insight.type === "concern" ? (
                    <TrendingDown className="h-4 w-4 text-critical" />
                  ) : (
                    <Badge className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium mb-1">{insight.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                  <p className="text-sm font-medium">Impact: {insight.impact}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
