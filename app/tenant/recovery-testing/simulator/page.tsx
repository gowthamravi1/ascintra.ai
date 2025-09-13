"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Search, Info, Play } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Stepper } from "@/components/ui/stepper"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface EC2Instance {
  id: string
  name: string
  region: string
  runningSnapshots: number
  state: string
}

interface Snapshot {
  id: string
  name: string
  ageInDays: number
  size: string
}

const mockInstances: EC2Instance[] = [
  { id: "i-0123456789abcdef0", name: "web-server-prod", region: "us-east-1", runningSnapshots: 3, state: "running" },
  { id: "i-0987654321fedcba0", name: "api-server-prod", region: "us-east-1", runningSnapshots: 2, state: "running" },
  { id: "i-0abcdef123456789", name: "db-server-prod", region: "us-west-2", runningSnapshots: 5, state: "running" },
  { id: "i-0fedcba987654321", name: "cache-server-prod", region: "us-west-2", runningSnapshots: 1, state: "stopped" },
]

const mockSnapshots: Snapshot[] = [
  { id: "ami-0123456789abcdef0", name: "web-server-snapshot-latest", ageInDays: 2, size: "8 GB" },
  { id: "ami-0987654321fedcba0", name: "web-server-snapshot-weekly", ageInDays: 7, size: "8 GB" },
  { id: "ami-0abcdef123456789", name: "web-server-snapshot-monthly", ageInDays: 30, size: "8 GB" },
]

const steps = ["Select Instance", "Choose Snapshot", "Health-Check Script", "Review & Simulate"]

export default function RecoverySimulatorPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedInstance, setSelectedInstance] = useState<EC2Instance | null>(null)
  const [selectedSnapshot, setSelectedSnapshot] = useState("")
  const [rto, setRto] = useState("")
  const [rpo, setRpo] = useState("")
  const [healthScript, setHealthScript] = useState(`#!/bin/bash
curl -sf http://localhost/health`)
  const [searchTerm, setSearchTerm] = useState("")
  const [isSimulating, setIsSimulating] = useState(false)

  const filteredInstances = mockInstances.filter(
    (instance) =>
      instance.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instance.id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const canProceedToStep = (step: number) => {
    switch (step) {
      case 1:
        return selectedInstance !== null
      case 2:
        return selectedSnapshot !== "" && rto !== "" && rpo !== ""
      case 3:
        return healthScript.trim() !== ""
      default:
        return true
    }
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1 && canProceedToStep(currentStep + 1)) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const simulateRecovery = async () => {
    setIsSimulating(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsSimulating(false)
    alert("Simulation started successfully!")
    router.push("/tenant/recovery-testing/dashboard")
  }

  const selectedSnapshotData = mockSnapshots.find((s) => s.id === selectedSnapshot)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/tenant/recovery-testing">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Recovery Testing
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Recovery Simulator</h1>
          <p className="text-muted-foreground">Test EC2 instance recovery procedures</p>
        </div>
      </div>

      {/* Stepper */}
      <Card>
        <CardContent className="pt-6">
          <Stepper steps={steps} currentStep={currentStep} />
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card>
        <CardContent className="pt-6">
          {/* Step 1: Select Instance */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Select EC2 Instance</h3>
                <p className="text-sm text-muted-foreground mb-4">Choose an EC2 instance to simulate recovery for</p>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search instances..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Instance ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Region</TableHead>
                      <TableHead>Snapshots</TableHead>
                      <TableHead>State</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInstances.map((instance) => (
                      <TableRow
                        key={instance.id}
                        className={`cursor-pointer hover:bg-muted/50 ${
                          selectedInstance?.id === instance.id ? "bg-primary/10" : ""
                        }`}
                        onClick={() => setSelectedInstance(instance)}
                      >
                        <TableCell className="font-mono text-sm">{instance.id}</TableCell>
                        <TableCell className="font-medium">{instance.name}</TableCell>
                        <TableCell>{instance.region}</TableCell>
                        <TableCell>{instance.runningSnapshots}</TableCell>
                        <TableCell>
                          <Badge variant={instance.state === "running" ? "success" : "secondary"}>
                            {instance.state}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {selectedInstance && (
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="pt-4">
                    <p className="text-sm">
                      <strong>Selected:</strong> {selectedInstance.name} ({selectedInstance.id})
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Step 2: Choose Snapshot */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Choose Snapshot & Recovery Objectives</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Select a snapshot and define your recovery time and point objectives
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="snapshot">Available Snapshots</Label>
                    <Select value={selectedSnapshot} onValueChange={setSelectedSnapshot}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a snapshot" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockSnapshots.map((snapshot) => (
                          <SelectItem key={snapshot.id} value={snapshot.id}>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm">{snapshot.id}</span>
                              <Badge variant={snapshot.ageInDays > 7 ? "warning" : "secondary"}>
                                {snapshot.ageInDays}d old
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedSnapshotData && (
                    <Card className="bg-muted/50">
                      <CardContent className="pt-4">
                        <div className="space-y-2 text-sm">
                          <p>
                            <strong>Name:</strong> {selectedSnapshotData.name}
                          </p>
                          <p>
                            <strong>Size:</strong> {selectedSnapshotData.size}
                          </p>
                          <p>
                            <strong>Age:</strong> {selectedSnapshotData.ageInDays} days
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="rto">Recovery Time Objective (RTO)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="rto"
                        type="number"
                        placeholder="15"
                        value={rto}
                        onChange={(e) => setRto(e.target.value)}
                      />
                      <span className="text-sm text-muted-foreground">minutes</span>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="rpo">Recovery Point Objective (RPO)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="rpo"
                        type="number"
                        placeholder="1"
                        value={rpo}
                        onChange={(e) => setRpo(e.target.value)}
                      />
                      <span className="text-sm text-muted-foreground">hours</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Health-Check Script */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Health-Check Script</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Define the script to verify instance health after recovery
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="script">Health Check Script</Label>
                    <Textarea
                      id="script"
                      value={healthScript}
                      onChange={(e) => setHealthScript(e.target.value)}
                      className="font-mono text-sm min-h-32"
                      placeholder="Enter your health check script..."
                    />
                  </div>
                </div>

                <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                      <Info className="h-4 w-4" />
                      Script Guidelines
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-blue-600 dark:text-blue-400">
                    <p>
                      <strong>Exit Codes:</strong>
                    </p>
                    <ul className="space-y-1 ml-4">
                      <li>
                        • <code>exit 0</code> = Health check passed
                      </li>
                      <li>
                        • <code>exit 1</code> = Health check failed
                      </li>
                    </ul>
                    <p>
                      <strong>Common Checks:</strong>
                    </p>
                    <ul className="space-y-1 ml-4">
                      <li>• HTTP endpoint availability</li>
                      <li>• Service process status</li>
                      <li>• Database connectivity</li>
                      <li>• File system mounts</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Step 4: Review & Simulate */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Review & Simulate</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Review your configuration and start the recovery simulation
                </p>
              </div>

              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle>Simulation Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Instance Details</h4>
                      <div className="space-y-1 text-sm">
                        <p>
                          <strong>ID:</strong> {selectedInstance?.id}
                        </p>
                        <p>
                          <strong>Name:</strong> {selectedInstance?.name}
                        </p>
                        <p>
                          <strong>Region:</strong> {selectedInstance?.region}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Recovery Configuration</h4>
                      <div className="space-y-1 text-sm">
                        <p>
                          <strong>Snapshot:</strong> {selectedSnapshot}
                        </p>
                        <p>
                          <strong>RTO:</strong> {rto} minutes
                        </p>
                        <p>
                          <strong>RPO:</strong> {rpo} hours
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Health Check Script</h4>
                    <pre className="bg-background border rounded p-3 text-sm overflow-x-auto">{healthScript}</pre>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 0}>
          Previous
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/tenant/recovery-testing")}>
            Cancel
          </Button>
          {currentStep < steps.length - 1 ? (
            <Button onClick={handleNext} disabled={!canProceedToStep(currentStep + 1)}>
              Next
            </Button>
          ) : (
            <Button onClick={simulateRecovery} disabled={isSimulating} className="bg-primary text-primary-foreground">
              {isSimulating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Simulating...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Simulate Now
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
