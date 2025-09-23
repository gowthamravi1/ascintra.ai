"use client"

import { useEffect, useState } from "react"
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
  RefreshCw,
} from "lucide-react"

type OverviewMetrics = {
  total_accounts: number
  total_resources: number
  total_protected: number
  avg_recovery_score: number
  avg_backup_coverage: number
  active_alerts: number
  running_scans: number
  compliance_status: number
  system_status: string
}

type RecoveryTrends = {
  backup_coverage: number
  backup_coverage_trend: number
  recovery_score: number
  recovery_score_trend: number
  rto_compliance: number
  rpo_compliance: number
  test_success_rate: number
  scan_count: number
}

type Activity = {
  type: string
  title: string
  description: string
  timestamp: string
  status: string
  icon: string
}

export default function TenantOverviewPage() {
  const [metrics, setMetrics] = useState<OverviewMetrics | null>(null)
  const [trends, setTrends] = useState<RecoveryTrends | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Load all data in parallel
      const [metricsRes, trendsRes, activitiesRes] = await Promise.all([
        fetch("/api/tenant/overview/metrics", { cache: "no-store" }),
        fetch("/api/tenant/overview/trends", { cache: "no-store" }),
        fetch("/api/tenant/overview/activities", { cache: "no-store" })
      ])

      if (metricsRes.ok) {
        const metricsData = await metricsRes.json()
        setMetrics(metricsData)
      }

      if (trendsRes.ok) {
        const trendsData = await trendsRes.json()
        setTrends(trendsData)
      }

      if (activitiesRes.ok) {
        const activitiesData = await activitiesRes.json()
        setActivities(activitiesData)
      }

      setLastUpdated(new Date())
    } catch (error) {
      console.error("Failed to load overview data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "info":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  }

  if (loading && !metrics) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading overview data...</span>
        </div>
      </div>
    )
  }
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Recovery Posture Overview</h1>
          <p className="text-gray-600 mt-1">Monitor your cloud recovery readiness and compliance status</p>
          {lastUpdated && (
            <p className="text-xs text-gray-500 mt-1">
              Last updated: {lastUpdated.toLocaleTimeString()}
              {loading && <RefreshCw className="inline h-3 w-3 ml-1 animate-spin" />}
            </p>
          )}
        </div>
        <Badge className={`${metrics?.system_status === 'operational' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'} hover:bg-opacity-80`}>
          <CheckCircle className="w-4 h-4 mr-1" />
          {metrics?.system_status === 'operational' ? 'All Systems Operational' : 'Attention Required'}
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
            <div className="text-2xl font-bold text-blue-600">
              {metrics?.avg_recovery_score || 0}%
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <Progress value={metrics?.avg_recovery_score || 0} className="flex-1" />
              {trends?.recovery_score_trend && (
                <Badge variant={trends.recovery_score_trend >= 0 ? "secondary" : "destructive"} className="text-xs">
                  {trends.recovery_score_trend >= 0 ? '+' : ''}{trends.recovery_score_trend.toFixed(1)}%
                </Badge>
              )}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {metrics?.avg_recovery_score && metrics.avg_recovery_score >= 80 ? 'Excellent recovery readiness' : 
               metrics?.avg_recovery_score && metrics.avg_recovery_score >= 60 ? 'Good recovery readiness' : 
               'Needs improvement'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Protected Assets</CardTitle>
            <Database className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.total_protected?.toLocaleString() || 0}</div>
            <div className="flex items-center space-x-2 mt-2">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-xs text-green-600">
                {metrics?.total_resources ? `${((metrics.total_protected / metrics.total_resources) * 100).toFixed(1)}% coverage` : 'No data'}
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Across {metrics?.total_accounts || 0} cloud account{metrics?.total_accounts !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Status</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics?.compliance_status || 0}%</div>
            <div className="flex items-center space-x-1 mt-2">
              <Badge variant="outline" className="text-xs">
                SOC 2
              </Badge>
              <Badge variant="outline" className="text-xs">
                DORA
              </Badge>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {metrics?.compliance_status && metrics.compliance_status >= 95 ? 'Excellent compliance' : 
               metrics?.compliance_status && metrics.compliance_status >= 80 ? 'Good compliance' : 
               'Needs attention'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{metrics?.active_alerts || 0}</div>
            <div className="flex items-center space-x-2 mt-2">
              {metrics?.running_scans && metrics.running_scans > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {metrics.running_scans} Running
                </Badge>
              )}
              {metrics?.active_alerts && metrics.active_alerts > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {metrics.active_alerts} Failed
                </Badge>
              )}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {metrics?.active_alerts && metrics.active_alerts > 0 ? 'Requires attention' : 'All systems healthy'}
            </p>
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
            <CardDescription>
              {trends?.scan_count ? `${trends.scan_count} scans in last 30 days` : '30-day recovery readiness trend'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Backup Coverage</span>
                <span className="text-sm text-gray-600">{trends?.backup_coverage || 0}%</span>
              </div>
              <Progress value={trends?.backup_coverage || 0} />

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">RTO Compliance</span>
                <span className="text-sm text-gray-600">{trends?.rto_compliance || 0}%</span>
              </div>
              <Progress value={trends?.rto_compliance || 0} />

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">RPO Compliance</span>
                <span className="text-sm text-gray-600">{trends?.rpo_compliance || 0}%</span>
              </div>
              <Progress value={trends?.rpo_compliance || 0} />

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Test Success Rate</span>
                <span className="text-sm text-gray-600">{trends?.test_success_rate || 0}%</span>
              </div>
              <Progress value={trends?.test_success_rate || 0} />
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
              {activities.length > 0 ? (
                activities.slice(0, 6).map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.status === 'success' ? 'bg-green-500' :
                      activity.status === 'info' ? 'bg-blue-500' :
                      activity.status === 'error' ? 'bg-red-500' : 'bg-gray-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-gray-600">
                        {activity.description} - {formatTimestamp(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No recent activities</p>
                </div>
              )}
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
