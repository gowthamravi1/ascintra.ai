"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Plus, MoreHorizontal, Play, Clock, CheckCircle, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScoreGauge } from "@/components/ui/score-gauge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Simulation {
  id: string
  instance: string
  snapshotId: string
  restoreSeconds: number
  bootSeconds: number
  result: "PASS" | "FAIL"
  date: string
  rto: number
  rpo: number
  healthScript: string
  logs: string
}

const mockSimulations: Simulation[] = [
  {
    id: "sim-001",
    instance: "web-server-prod",
    snapshotId: "ami-0123456789abcdef0",
    restoreSeconds: 180,
    bootSeconds: 45,
    result: "PASS",
    date: "2024-01-09 14:30",
    rto: 15,
    rpo: 1,
    healthScript: "#!/bin/bash\ncurl -sf http://localhost/health",
    logs: `[2024-01-09 14:30:15] Starting recovery simulation...
[2024-01-09 14:30:16] Creating instance from snapshot ami-0123456789abcdef0
[2024-01-09 14:30:45] Instance i-0abc123def456789 created successfully
[2024-01-09 14:31:30] Instance boot completed (45s)
[2024-01-09 14:33:15] Running health check script...
[2024-01-09 14:33:16] Health check: HTTP 200 OK
[2024-01-09 14:33:16] ✓ Recovery simulation completed successfully
[2024-01-09 14:33:16] Total recovery time: 3m 1s (RTO target: 15m)`,
  },
  {
    id: "sim-002",
    instance: "api-server-prod",
    snapshotId: "ami-0987654321fedcba0",
    restoreSeconds: 240,
    bootSeconds: 52,
    result: "FAIL",
    date: "2024-01-09 13:15",
    rto: 10,
    rpo: 2,
    healthScript: "#!/bin/bash\ncurl -sf http://localhost:8080/api/health",
    logs: `[2024-01-09 13:15:30] Starting recovery simulation...
[2024-01-09 13:15:31] Creating instance from snapshot ami-0987654321fedcba0
[2024-01-09 13:16:15] Instance i-0def456abc789123 created successfully
[2024-01-09 13:17:07] Instance boot completed (52s)
[2024-01-09 13:19:30] Running health check script...
[2024-01-09 13:19:31] Health check: Connection refused
[2024-01-09 13:19:31] ✗ Health check failed - API service not responding
[2024-01-09 13:19:31] Recovery simulation failed
[2024-01-09 13:19:31] Total recovery time: 4m 0s (RTO target: 10m)`,
  },
  {
    id: "sim-003",
    instance: "db-server-prod",
    snapshotId: "ami-0abcdef123456789",
    restoreSeconds: 320,
    bootSeconds: 78,
    result: "PASS",
    date: "2024-01-09 11:45",
    rto: 20,
    rpo: 4,
    healthScript: "#!/bin/bash\npg_isready -h localhost -p 5432",
    logs: `[2024-01-09 11:45:12] Starting recovery simulation...
[2024-01-09 11:45:13] Creating instance from snapshot ami-0abcdef123456789
[2024-01-09 11:46:25] Instance i-0ghi789jkl012345 created successfully
[2024-01-09 11:47:43] Instance boot completed (78s)
[2024-01-09 11:50:32] Running health check script...
[2024-01-09 11:50:33] PostgreSQL accepting connections
[2024-01-09 11:50:33] ✓ Recovery simulation completed successfully
[2024-01-09 11:50:33] Total recovery time: 5m 21s (RTO target: 20m)`,
  },
]

function Label({ className, children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={`text-sm font-medium leading-none ${className || ""}`} {...props}>
      {children}
    </label>
  )
}

export default function RecoveryDashboardPage() {
  const [selectedSimulation, setSelectedSimulation] = useState<Simulation | null>(null)

  const totalSimulations = mockSimulations.length
  const passedSimulations = mockSimulations.filter((s) => s.result === "PASS").length
  const passRate = Math.round((passedSimulations / totalSimulations) * 100)
  const avgRestoreTime = Math.round(mockSimulations.reduce((sum, s) => sum + s.restoreSeconds, 0) / totalSimulations)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Recovery Simulations</h1>
          <p className="text-muted-foreground">Monitor and analyze recovery test results</p>
        </div>
        <div className="flex gap-3">
          <Link href="/tenant/recovery-testing">
            <Button variant="outline">Back to Testing Center</Button>
          </Link>
          <Link href="/tenant/recovery-testing/simulator">
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Plus className="h-4 w-4 mr-2" />
              New Simulation
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Simulations</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSimulations}</div>
            <p className="text-xs text-muted-foreground">Today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <ScoreGauge value={passRate} size={32} />
              <div>
                <div className="text-2xl font-bold">{passRate}%</div>
                <p className="text-xs text-muted-foreground">Success rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Restore Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgRestoreTime}s</div>
            <p className="text-xs text-muted-foreground">Average duration</p>
          </CardContent>
        </Card>
      </div>

      {/* Simulations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Simulations</CardTitle>
          <CardDescription>Recovery test results and performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Instance</TableHead>
                  <TableHead>Snapshot ID</TableHead>
                  <TableHead>Restore Time</TableHead>
                  <TableHead>Boot Time</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[50px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockSimulations.map((simulation) => (
                  <TableRow key={simulation.id} className="hover:bg-muted/50 dark:hover:bg-muted/40">
                    <TableCell className="font-medium">{simulation.instance}</TableCell>
                    <TableCell className="font-mono text-sm">{simulation.snapshotId}</TableCell>
                    <TableCell>{simulation.restoreSeconds}s</TableCell>
                    <TableCell>{simulation.bootSeconds}s</TableCell>
                    <TableCell>
                      <Badge variant={simulation.result === "PASS" ? "success" : "destructive"}>
                        {simulation.result}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{simulation.date}</TableCell>
                    <TableCell>
                      <Drawer>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DrawerTrigger asChild>
                              <DropdownMenuItem onClick={() => setSelectedSimulation(simulation)}>
                                View Details
                              </DropdownMenuItem>
                            </DrawerTrigger>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Sandbox
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>

                        <DrawerContent>
                          <DrawerHeader>
                            <DrawerTitle>Simulation Details</DrawerTitle>
                            <DrawerDescription>
                              Recovery simulation for {selectedSimulation?.instance}
                            </DrawerDescription>
                          </DrawerHeader>
                          <div className="p-6 space-y-6">
                            {selectedSimulation && (
                              <>
                                {/* Simulation Details Grid */}
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <Label>Instance:</Label>
                                    <p className="text-muted-foreground">{selectedSimulation.instance}</p>
                                  </div>
                                  <div>
                                    <Label>Snapshot ID:</Label>
                                    <p className="text-muted-foreground font-mono">{selectedSimulation.snapshotId}</p>
                                  </div>
                                  <div>
                                    <Label>RTO Target:</Label>
                                    <p className="text-muted-foreground">{selectedSimulation.rto} minutes</p>
                                  </div>
                                  <div>
                                    <Label>RPO Target:</Label>
                                    <p className="text-muted-foreground">{selectedSimulation.rpo} hours</p>
                                  </div>
                                  <div>
                                    <Label>Restore Time:</Label>
                                    <p className="text-muted-foreground">{selectedSimulation.restoreSeconds}s</p>
                                  </div>
                                  <div>
                                    <Label>Boot Time:</Label>
                                    <p className="text-muted-foreground">{selectedSimulation.bootSeconds}s</p>
                                  </div>
                                  <div>
                                    <Label>Result:</Label>
                                    <Badge variant={selectedSimulation.result === "PASS" ? "success" : "destructive"}>
                                      {selectedSimulation.result}
                                    </Badge>
                                  </div>
                                  <div>
                                    <Label>Date:</Label>
                                    <p className="text-muted-foreground">{selectedSimulation.date}</p>
                                  </div>
                                </div>

                                {/* Health Check Script */}
                                <div>
                                  <h4 className="font-medium mb-2">Health Check Script</h4>
                                  <pre className="bg-muted p-3 rounded-lg text-sm overflow-x-auto">
                                    {selectedSimulation.healthScript}
                                  </pre>
                                </div>

                                {/* Log Viewer */}
                                <div>
                                  <h4 className="font-medium mb-2">Simulation Logs</h4>
                                  <pre className="bg-slate-900 text-green-400 p-3 rounded-lg overflow-y-auto h-64 text-sm">
                                    {selectedSimulation.logs}
                                  </pre>
                                </div>

                                {/* Actions */}
                                <div className="flex justify-end pt-4 border-t">
                                  <Button variant="destructive" size="sm">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Sandbox
                                  </Button>
                                </div>
                              </>
                            )}
                          </div>
                        </DrawerContent>
                      </Drawer>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
