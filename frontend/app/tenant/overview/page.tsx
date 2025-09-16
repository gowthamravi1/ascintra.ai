"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Shield,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Database,
  Activity,
  BarChart3,
  Users,
  Clock,
  Target,
} from "lucide-react"

export default function TenantOverviewPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Recovery Posture Overview</h1>
          <p className="text-gray-600 mt-1">Monitor your cloud recovery readiness and compliance status</p>
        </div>
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle className="w-4 h-4 mr-1" />
          All Systems Operational
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recovery Posture Score</CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">87%</div>
            <div className="flex items-center space-x-2 mt-2">
              <Progress value={87} className="flex-1" />
              <Badge variant="secondary" className="text-xs">
                +5%
              </Badge>
            </div>
            <p className="text-xs text-gray-600 mt-1">Excellent recovery readiness</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Protected Assets</CardTitle>
            <Database className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <div className="flex items-center space-x-2 mt-2">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-xs text-green-600">+12 this week</span>
            </div>
            <p className="text-xs text-gray-600 mt-1">Across 3 cloud providers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Status</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">98.5%</div>
            <div className="flex items-center space-x-1 mt-2">
              <Badge variant="outline" className="text-xs">
                SOC 2
              </Badge>
              <Badge variant="outline" className="text-xs">
                DORA
              </Badge>
            </div>
            <p className="text-xs text-gray-600 mt-1">2 minor findings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">3</div>
            <div className="flex items-center space-x-2 mt-2">
              <Badge variant="destructive" className="text-xs">
                1 High
              </Badge>
              <Badge variant="secondary" className="text-xs">
                2 Medium
              </Badge>
            </div>
            <p className="text-xs text-gray-600 mt-1">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recovery Posture Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Recovery Posture Trends
            </CardTitle>
            <CardDescription>30-day recovery readiness trend</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Backup Coverage</span>
                <span className="text-sm text-gray-600">94%</span>
              </div>
              <Progress value={94} />

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">RTO Compliance</span>
                <span className="text-sm text-gray-600">89%</span>
              </div>
              <Progress value={89} />

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">RPO Compliance</span>
                <span className="text-sm text-gray-600">92%</span>
              </div>
              <Progress value={92} />

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Test Success Rate</span>
                <span className="text-sm text-gray-600">85%</span>
              </div>
              <Progress value={85} />
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activities
            </CardTitle>
            <CardDescription>Latest recovery and compliance events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Backup verification completed</p>
                  <p className="text-xs text-gray-600">AWS RDS instances - 2 minutes ago</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Recovery test scheduled</p>
                  <p className="text-xs text-gray-600">Azure VM recovery - 15 minutes ago</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Configuration drift detected</p>
                  <p className="text-xs text-gray-600">GCP storage policies - 1 hour ago</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Compliance scan completed</p>
                  <p className="text-xs text-gray-600">SOC 2 Type II - 2 hours ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>Common recovery posture management tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2 bg-transparent">
              <Shield className="h-6 w-6 text-blue-600" />
              <span className="text-sm font-medium">Run Recovery Test</span>
            </Button>

            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2 bg-transparent">
              <BarChart3 className="h-6 w-6 text-green-600" />
              <span className="text-sm font-medium">View Scorecard</span>
            </Button>

            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2 bg-transparent">
              <Users className="h-6 w-6 text-purple-600" />
              <span className="text-sm font-medium">Executive Report</span>
            </Button>

            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2 bg-transparent">
              <Clock className="h-6 w-6 text-orange-600" />
              <span className="text-sm font-medium">Schedule Audit</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
