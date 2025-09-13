"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, ExternalLink, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import Link from "next/link"

const resourceDetails = {
  id: "i-0123456789abcdef0",
  type: "EC2 Instance",
  region: "us-east-1",
  accountId: "123456789012",
  tags: {
    Environment: "Production",
    Team: "Backend",
    Application: "API Server",
    CostCenter: "Engineering",
  },
  configuration: {
    instanceType: "t3.medium",
    state: "running",
    publicIp: "54.123.45.67",
    privateIp: "10.0.1.45",
    vpcId: "vpc-0123456789abcdef0",
    subnetId: "subnet-0123456789abcdef0",
    securityGroups: ["sg-0123456789abcdef0", "sg-0987654321fedcba0"],
    keyName: "production-key",
    launchTime: "2024-01-01T10:30:00Z",
  },
  findings: [
    {
      id: "finding-001",
      severity: "high",
      title: "Instance allows unrestricted SSH access",
      description: "Security group allows SSH (port 22) access from 0.0.0.0/0",
      recommendation: "Restrict SSH access to specific IP ranges or use AWS Systems Manager Session Manager",
      status: "open",
    },
    {
      id: "finding-002",
      severity: "medium",
      title: "Instance not using IMDSv2",
      description: "Instance metadata service is not configured to require IMDSv2",
      recommendation: "Configure the instance to require IMDSv2 for enhanced security",
      status: "open",
    },
    {
      id: "finding-003",
      severity: "low",
      title: "Missing backup tags",
      description: "Instance does not have backup-related tags configured",
      recommendation: "Add backup schedule and retention tags for automated backup management",
      status: "acknowledged",
    },
  ],
}

export default function ResourceDetailsPage() {
  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case "critical":
        return "critical"
      case "high":
        return "critical"
      case "medium":
        return "warning"
      case "low":
        return "secondary"
      default:
        return "secondary"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <AlertTriangle className="h-4 w-4 text-critical" />
      case "acknowledged":
        return <Clock className="h-4 w-4 text-warning" />
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-success" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/tenant/inventory">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Inventory
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Resource Details</h1>
          <p className="text-muted-foreground">{resourceDetails.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {resourceDetails.type}
                  <Badge variant="outline">{resourceDetails.region}</Badge>
                </CardTitle>
                <CardDescription>{resourceDetails.id}</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <ExternalLink className="h-4 w-4" />
                View in AWS
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="configuration">Configuration</TabsTrigger>
                <TabsTrigger value="findings">Security Findings</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Basic Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Resource Type:</span>
                        <span>{resourceDetails.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Region:</span>
                        <span>{resourceDetails.region}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Account ID:</span>
                        <span>{resourceDetails.accountId}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Tags</h4>
                    <div className="space-y-2">
                      {Object.entries(resourceDetails.tags).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {key}: {value}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="configuration" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Instance Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Instance Type:</span>
                        <span>{resourceDetails.configuration.instanceType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">State:</span>
                        <Badge variant="success">{resourceDetails.configuration.state}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Launch Time:</span>
                        <span>{new Date(resourceDetails.configuration.launchTime).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Key Name:</span>
                        <span>{resourceDetails.configuration.keyName}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3">Network Configuration</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Public IP:</span>
                        <span>{resourceDetails.configuration.publicIp}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Private IP:</span>
                        <span>{resourceDetails.configuration.privateIp}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">VPC ID:</span>
                        <span className="font-mono text-xs">{resourceDetails.configuration.vpcId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subnet ID:</span>
                        <span className="font-mono text-xs">{resourceDetails.configuration.subnetId}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="findings" className="space-y-4">
                <div className="space-y-4">
                  {resourceDetails.findings.map((finding) => (
                    <Card key={finding.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(finding.status)}
                            <h4 className="font-medium">{finding.title}</h4>
                          </div>
                          <Badge variant={getSeverityBadgeVariant(finding.severity)}>{finding.severity}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{finding.description}</p>
                        <div className="bg-muted/50 p-3 rounded-lg">
                          <p className="text-sm">
                            <strong>Recommendation:</strong> {finding.recommendation}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-critical">3</div>
                <div className="text-sm text-muted-foreground">Total Findings</div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>High Severity</span>
                  <span className="text-critical font-medium">1</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Medium Severity</span>
                  <span className="text-warning font-medium">1</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Low Severity</span>
                  <span className="text-muted-foreground">1</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                Generate Report
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                Export Configuration
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                Schedule Scan
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
