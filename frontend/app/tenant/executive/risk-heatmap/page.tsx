"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { HeatCell } from "@/components/ui/heat-cell"
import { AlertTriangle, Shield, DollarSign, Users, FileText, Calendar, Filter } from "lucide-react"
import { useState } from "react"

const riskCategories = ["Operational", "Security", "Compliance", "Financial", "Strategic", "Technology"]

const businessUnits = ["Engineering", "Sales", "Marketing", "Finance", "HR", "Operations", "Legal", "IT"]

const riskMatrix = [
  { category: "Operational", unit: "Engineering", impact: 4, probability: 3, score: 12, trend: "stable" },
  { category: "Operational", unit: "Sales", impact: 3, probability: 2, score: 6, trend: "down" },
  { category: "Operational", unit: "Marketing", impact: 2, probability: 3, score: 6, trend: "up" },
  { category: "Operational", unit: "Finance", impact: 4, probability: 2, score: 8, trend: "stable" },
  { category: "Operational", unit: "HR", impact: 3, probability: 2, score: 6, trend: "down" },
  { category: "Operational", unit: "Operations", impact: 5, probability: 3, score: 15, trend: "up" },
  { category: "Operational", unit: "Legal", impact: 2, probability: 1, score: 2, trend: "stable" },
  { category: "Operational", unit: "IT", impact: 4, probability: 4, score: 16, trend: "stable" },

  { category: "Security", unit: "Engineering", impact: 5, probability: 3, score: 15, trend: "down" },
  { category: "Security", unit: "Sales", impact: 3, probability: 3, score: 9, trend: "stable" },
  { category: "Security", unit: "Marketing", impact: 3, probability: 2, score: 6, trend: "down" },
  { category: "Security", unit: "Finance", impact: 5, probability: 2, score: 10, trend: "stable" },
  { category: "Security", unit: "HR", impact: 4, probability: 2, score: 8, trend: "stable" },
  { category: "Security", unit: "Operations", impact: 4, probability: 3, score: 12, trend: "up" },
  { category: "Security", unit: "Legal", impact: 3, probability: 1, score: 3, trend: "stable" },
  { category: "Security", unit: "IT", impact: 5, probability: 4, score: 20, trend: "down" },

  { category: "Compliance", unit: "Engineering", impact: 3, probability: 2, score: 6, trend: "stable" },
  { category: "Compliance", unit: "Sales", impact: 4, probability: 2, score: 8, trend: "stable" },
  { category: "Compliance", unit: "Marketing", impact: 3, probability: 2, score: 6, trend: "stable" },
  { category: "Compliance", unit: "Finance", impact: 5, probability: 2, score: 10, trend: "up" },
  { category: "Compliance", unit: "HR", impact: 4, probability: 3, score: 12, trend: "stable" },
  { category: "Compliance", unit: "Operations", impact: 3, probability: 2, score: 6, trend: "down" },
  { category: "Compliance", unit: "Legal", impact: 5, probability: 1, score: 5, trend: "stable" },
  { category: "Compliance", unit: "IT", impact: 4, probability: 2, score: 8, trend: "stable" },

  { category: "Financial", unit: "Engineering", impact: 4, probability: 2, score: 8, trend: "up" },
  { category: "Financial", unit: "Sales", impact: 5, probability: 3, score: 15, trend: "stable" },
  { category: "Financial", unit: "Marketing", impact: 4, probability: 3, score: 12, trend: "up" },
  { category: "Financial", unit: "Finance", impact: 5, probability: 2, score: 10, trend: "stable" },
  { category: "Financial", unit: "HR", impact: 3, probability: 2, score: 6, trend: "stable" },
  { category: "Financial", unit: "Operations", impact: 4, probability: 3, score: 12, trend: "stable" },
  { category: "Financial", unit: "Legal", impact: 3, probability: 1, score: 3, trend: "stable" },
  { category: "Financial", unit: "IT", impact: 4, probability: 2, score: 8, trend: "down" },

  { category: "Strategic", unit: "Engineering", impact: 4, probability: 3, score: 12, trend: "stable" },
  { category: "Strategic", unit: "Sales", impact: 5, probability: 4, score: 20, trend: "up" },
  { category: "Strategic", unit: "Marketing", impact: 4, probability: 3, score: 12, trend: "stable" },
  { category: "Strategic", unit: "Finance", impact: 3, probability: 2, score: 6, trend: "stable" },
  { category: "Strategic", unit: "HR", impact: 3, probability: 2, score: 6, trend: "stable" },
  { category: "Strategic", unit: "Operations", impact: 4, probability: 2, score: 8, trend: "stable" },
  { category: "Strategic", unit: "Legal", impact: 2, probability: 1, score: 2, trend: "stable" },
  { category: "Strategic", unit: "IT", impact: 4, probability: 3, score: 12, trend: "up" },

  { category: "Technology", unit: "Engineering", impact: 5, probability: 4, score: 20, trend: "stable" },
  { category: "Technology", unit: "Sales", impact: 3, probability: 2, score: 6, trend: "down" },
  { category: "Technology", unit: "Marketing", impact: 3, probability: 3, score: 9, trend: "stable" },
  { category: "Technology", unit: "Finance", impact: 4, probability: 2, score: 8, trend: "stable" },
  { category: "Technology", unit: "HR", impact: 2, probability: 2, score: 4, trend: "stable" },
  { category: "Technology", unit: "Operations", impact: 4, probability: 3, score: 12, trend: "up" },
  { category: "Technology", unit: "Legal", impact: 2, probability: 1, score: 2, trend: "stable" },
  { category: "Technology", unit: "IT", impact: 5, probability: 4, score: 20, trend: "down" },
]

const priorityActions = [
  {
    risk: "IT Security Breach",
    category: "Security",
    unit: "IT",
    action: "Implement Zero Trust Architecture",
    priority: "Critical",
  },
  {
    risk: "Sales Pipeline Disruption",
    category: "Strategic",
    unit: "Sales",
    action: "Diversify Customer Base",
    priority: "High",
  },
  {
    risk: "Operations Downtime",
    category: "Operational",
    unit: "Operations",
    action: "Enhance Monitoring Systems",
    priority: "High",
  },
  {
    risk: "Engineering Scalability",
    category: "Technology",
    unit: "Engineering",
    action: "Modernize Infrastructure",
    priority: "High",
  },
  {
    risk: "Financial Compliance",
    category: "Compliance",
    unit: "Finance",
    action: "Update Audit Procedures",
    priority: "Medium",
  },
]

export default function RiskHeatMap() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedUnit, setSelectedUnit] = useState<string>("all")

  const filteredRisks = riskMatrix.filter((risk) => {
    const categoryMatch = selectedCategory === "all" || risk.category === selectedCategory
    const unitMatch = selectedUnit === "all" || risk.unit === selectedUnit
    return categoryMatch && unitMatch
  })

  const getRiskLevel = (score: number) => {
    if (score >= 16) return "critical"
    if (score >= 12) return "high"
    if (score >= 6) return "medium"
    return "low"
  }

  const getRiskCounts = () => {
    const counts = { critical: 0, high: 0, medium: 0, low: 0 }
    filteredRisks.forEach((risk) => {
      const level = getRiskLevel(risk.score)
      counts[level as keyof typeof counts]++
    })
    return counts
  }

  const riskCounts = getRiskCounts()

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Enterprise Risk Heat Map</h1>
          <p className="text-muted-foreground">Comprehensive risk assessment across business units</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 bg-transparent">
            <FileText className="h-4 w-4" />
            Risk Report
          </Button>
          <Button variant="outline" className="gap-2 bg-transparent">
            <Calendar className="h-4 w-4" />
            Schedule Assessment
          </Button>
        </div>
      </div>

      {/* Risk Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass apple-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Risks</CardTitle>
            <AlertTriangle className="h-4 w-4 text-apple-red" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-apple-red">{riskCounts.critical}</div>
            <p className="text-xs text-muted-foreground">Immediate attention required</p>
          </CardContent>
        </Card>

        <Card className="glass apple-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risks</CardTitle>
            <Shield className="h-4 w-4 text-apple-orange" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-apple-orange">{riskCounts.high}</div>
            <p className="text-xs text-muted-foreground">Action needed within 30 days</p>
          </CardContent>
        </Card>

        <Card className="glass apple-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medium Risks</CardTitle>
            <DollarSign className="h-4 w-4 text-apple-yellow" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-apple-yellow">{riskCounts.medium}</div>
            <p className="text-xs text-muted-foreground">Monitor and plan mitigation</p>
          </CardContent>
        </Card>

        <Card className="glass apple-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Risks</CardTitle>
            <Users className="h-4 w-4 text-apple-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-apple-green">{riskCounts.low}</div>
            <p className="text-xs text-muted-foreground">Acceptable risk levels</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Risk Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Risk Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {riskCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Business Unit</label>
              <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                <SelectTrigger>
                  <SelectValue placeholder="All Units" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Units</SelectItem>
                  {businessUnits.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Heat Map Matrix */}
      <Card className="glass-elevated">
        <CardHeader>
          <CardTitle>Risk Assessment Matrix</CardTitle>
          <CardDescription>Risk scores by category and business unit (Impact × Probability)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Header Row */}
              <div className="grid grid-cols-9 gap-2 mb-2">
                <div className="p-2 font-medium text-center">Category / Unit</div>
                {businessUnits.map((unit) => (
                  <div key={unit} className="p-2 font-medium text-center text-sm">
                    {unit}
                  </div>
                ))}
              </div>

              {/* Risk Matrix Rows */}
              {riskCategories.map((category) => (
                <div key={category} className="grid grid-cols-9 gap-2 mb-2">
                  <div className="p-2 font-medium text-sm flex items-center">{category}</div>
                  {businessUnits.map((unit) => {
                    const risk = filteredRisks.find((r) => r.category === category && r.unit === unit)
                    return (
                      <HeatCell
                        key={`${category}-${unit}`}
                        value={risk?.score || 0}
                        maxValue={25}
                        trend={risk?.trend || "stable"}
                        className="h-12"
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6 flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-apple-green rounded"></div>
              <span className="text-sm">Low (1-5)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-apple-yellow rounded"></div>
              <span className="text-sm">Medium (6-11)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-apple-orange rounded"></div>
              <span className="text-sm">High (12-15)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-apple-red rounded"></div>
              <span className="text-sm">Critical (16-25)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Priority Actions */}
      <Card className="glass-elevated">
        <CardHeader>
          <CardTitle>Priority Risk Mitigation Actions</CardTitle>
          <CardDescription>Recommended actions for high-priority risks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {priorityActions.map((action, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge
                      variant={
                        action.priority === "Critical"
                          ? "destructive"
                          : action.priority === "High"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {action.priority}
                    </Badge>
                    <span className="font-semibold">{action.risk}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    <strong>Category:</strong> {action.category} | <strong>Unit:</strong> {action.unit}
                  </p>
                  <p className="text-sm">
                    <strong>Recommended Action:</strong> {action.action}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Assign
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
