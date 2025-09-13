"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Plus, MoreHorizontal, Eye, Pause, Play } from "lucide-react"
import { ScoreGauge } from "@/components/ui/score-gauge"

const tenants = [
  {
    id: 1,
    name: "Acme Corporation",
    plan: "Enterprise",
    postureScore: 92,
    assets: 1247,
    status: "active",
    lastScan: "2 hours ago",
  },
  {
    id: 2,
    name: "TechStart Inc",
    plan: "Pro",
    postureScore: 78,
    assets: 456,
    status: "active",
    lastScan: "1 day ago",
  },
  {
    id: 3,
    name: "Global Dynamics",
    plan: "Enterprise",
    postureScore: 85,
    assets: 2341,
    status: "suspended",
    lastScan: "3 days ago",
  },
  {
    id: 4,
    name: "Innovation Labs",
    plan: "Free",
    postureScore: 65,
    assets: 89,
    status: "active",
    lastScan: "5 hours ago",
  },
  {
    id: 5,
    name: "SecureFlow Systems",
    plan: "Pro",
    postureScore: 94,
    assets: 678,
    status: "active",
    lastScan: "30 minutes ago",
  },
]

export default function TenantsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  const filteredTenants = tenants.filter((tenant) => tenant.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 90) return "success"
    if (score >= 70) return "warning"
    return "critical"
  }

  const getPlanBadgeVariant = (plan: string) => {
    switch (plan) {
      case "Enterprise":
        return "default"
      case "Pro":
        return "info"
      case "Free":
        return "secondary"
      default:
        return "secondary"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tenants</h1>
          <p className="text-muted-foreground">Manage and monitor all tenant accounts</p>
        </div>
        <Link href="/admin/tenants/provision">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Provision Tenant
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">195</div>
            <p className="text-xs text-muted-foreground">+12 this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">187</div>
            <p className="text-xs text-muted-foreground">95.9% uptime</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Suspended</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">8</div>
            <p className="text-xs text-muted-foreground">Billing issues</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">82.4</div>
            <p className="text-xs text-muted-foreground">+2.1 this week</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>All Tenants</CardTitle>
          <CardDescription>Search and manage tenant accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tenants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tenant Name</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Posture Score</TableHead>
                <TableHead>Assets</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Scan</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTenants.map((tenant) => (
                <TableRow key={tenant.id}>
                  <TableCell className="font-medium">{tenant.name}</TableCell>
                  <TableCell>
                    <Badge variant={getPlanBadgeVariant(tenant.plan)}>{tenant.plan}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <ScoreGauge value={tenant.postureScore} size={40} showValue={false} />
                      <div>
                        <div className="font-medium">{tenant.postureScore}</div>
                        <Badge variant={getScoreBadgeVariant(tenant.postureScore)} className="text-xs">
                          {tenant.postureScore >= 90
                            ? "Excellent"
                            : tenant.postureScore >= 70
                              ? "Good"
                              : "Needs Attention"}
                        </Badge>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{tenant.assets.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={tenant.status === "active" ? "success" : "warning"}>{tenant.status}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{tenant.lastScan}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          {tenant.status === "active" ? (
                            <>
                              <Pause className="mr-2 h-4 w-4" />
                              Suspend
                            </>
                          ) : (
                            <>
                              <Play className="mr-2 h-4 w-4" />
                              Activate
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
