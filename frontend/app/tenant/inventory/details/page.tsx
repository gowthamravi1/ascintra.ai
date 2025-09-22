"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { AlertTriangle, Info, ExternalLink, Copy, Shield, Settings, Tag, Clock, MapPin } from "lucide-react"

type ResourceData = {
  id: string
  name: string
  type: string
  service: string
  region?: string
  account?: string
  status?: string
  created?: string
  lastModified?: string
  last_backup?: string | null
  tags?: Record<string, string>
}

const securityFindings = [
  {
    id: "finding-001",
    severity: "high",
    title: "Security group allows unrestricted SSH access",
    description: "Security group sg-0123456789abcdef0 allows SSH (port 22) access from 0.0.0.0/0",
    framework: "CIS AWS",
    control: "4.1",
    status: "open",
    firstSeen: "2024-01-15T14:30:00Z",
    recommendation: "Restrict SSH access to specific IP ranges or use AWS Systems Manager Session Manager",
  },
  {
    id: "finding-002",
    severity: "medium",
    title: "Instance not using IMDSv2",
    description: "EC2 instance is not configured to require IMDSv2 for metadata access",
    framework: "AWS Security Best Practices",
    control: "EC2.8",
    status: "acknowledged",
    firstSeen: "2024-01-12T10:15:00Z",
    recommendation: "Configure the instance to require IMDSv2 for enhanced security",
  },
  {
    id: "finding-003",
    severity: "low",
    title: "Missing recommended tags",
    description: "Instance is missing recommended tags: Owner, Project",
    framework: "Organizational Policy",
    control: "TAG.1",
    status: "open",
    firstSeen: "2024-01-10T14:30:00Z",
    recommendation: "Add Owner and Project tags for better resource management",
  },
]

// Configuration details are loaded dynamically from backend

export default function ResourceDetailsPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [resourceData, setResourceData] = useState<ResourceData | null>(null)
  const [configuration, setConfiguration] = useState<Record<string, any>>({})
  const [metadata, setMetadata] = useState<Record<string, any>>({})
  const params = useSearchParams()

  useEffect(() => {
    const id = params.get("id")
    if (!id) return
    const load = async () => {
      try {
        const res = await fetch(`/api/tenant/inventory/details/${encodeURIComponent(id)}`, { cache: "no-store" })
        const data = await res.json()
        if (data?.ok && data?.item) {
          const it = data.item
          setResourceData({
            id: it.id,
            name: it.name,
            type: it.type,
            service: it.service,
            region: it.region,
            account: it.account_id,
            status: it.status,
            last_backup: it.last_backup,
            tags: it.metadata?.tags || it.tags || {},
          })
          setConfiguration(it.configuration || {})
          setMetadata(it.metadata || {})
        }
      } catch {}
    }
    load()
  }, [params])

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return <Badge variant="critical">Critical</Badge>
      case "high":
        return <Badge variant="critical">High</Badge>
      case "medium":
        return <Badge variant="warning">Medium</Badge>
      case "low":
        return <Badge variant="secondary">Low</Badge>
      default:
        return <Badge variant="secondary">{severity}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge variant="critical">Open</Badge>
      case "acknowledged":
        return <Badge variant="warning">Acknowledged</Badge>
      case "resolved":
        return <Badge variant="success">Resolved</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  if (!resourceData) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-foreground">{resourceData.name}</h1>
            <Badge variant="success">{resourceData.status || ""}</Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Shield className="h-4 w-4" />
              <span>{resourceData.type}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{resourceData.region || ""}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {resourceData.last_backup && <span>Last backup {new Date(resourceData.last_backup).toLocaleString()}</span>}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 bg-transparent">
            <ExternalLink className="h-4 w-4" />
            View in AWS Console
          </Button>
          <Button variant="outline" className="gap-2 bg-transparent">
            <Settings className="h-4 w-4" />
            Manage Resource
          </Button>
        </div>
      </div>

      {/* Resource ID Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Resource ID</p>
                <p className="font-mono text-sm">{resourceData.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Account</p>
                <p className="font-mono text-sm">{resourceData.account || ""}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Service</p>
                <p className="text-sm">{resourceData.service}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(resourceData.id)}
              className="gap-2 bg-transparent"
            >
              <Copy className="h-4 w-4" />
              Copy ID
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="security">Security Findings</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="metadata">Metadata</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Security Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Security Summary</CardTitle>
              <CardDescription>Overview of security findings for this resource</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-critical">1</div>
                  <div className="text-sm text-muted-foreground">High Severity</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-warning">1</div>
                  <div className="text-sm text-muted-foreground">Medium Severity</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary">1</div>
                  <div className="text-sm text-muted-foreground">Low Severity</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">3</div>
                  <div className="text-sm text-muted-foreground">Total Findings</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Findings */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Findings</CardTitle>
              <CardDescription>Latest security findings for this resource</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityFindings.slice(0, 3).map((finding) => (
                  <div key={finding.id} className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className="mt-1">
                      {finding.severity === "high" ? (
                        <AlertTriangle className="h-5 w-5 text-critical" />
                      ) : finding.severity === "medium" ? (
                        <AlertTriangle className="h-5 w-5 text-warning" />
                      ) : (
                        <Info className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{finding.title}</h4>
                        {getSeverityBadge(finding.severity)}
                        {getStatusBadge(finding.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{finding.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>
                          {finding.framework} - {finding.control}
                        </span>
                        <span>First seen: {new Date(finding.firstSeen).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Findings</CardTitle>
              <CardDescription>All security findings for this resource</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {securityFindings.map((finding) => (
                  <Card key={finding.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {finding.severity === "high" ? (
                            <AlertTriangle className="h-5 w-5 text-critical" />
                          ) : finding.severity === "medium" ? (
                            <AlertTriangle className="h-5 w-5 text-warning" />
                          ) : (
                            <Info className="h-5 w-5 text-muted-foreground" />
                          )}
                          <div>
                            <h4 className="font-medium">{finding.title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              {getSeverityBadge(finding.severity)}
                              {getStatusBadge(finding.status)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <div>First seen: {new Date(finding.firstSeen).toLocaleDateString()}</div>
                          <div>
                            {finding.framework} - {finding.control}
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mb-4">{finding.description}</p>

                      <div className="bg-muted/50 p-3 rounded-lg mb-4">
                        <p className="text-sm">
                          <strong>Recommendation:</strong> {finding.recommendation}
                        </p>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" className="bg-transparent">
                          Mark as Acknowledged
                        </Button>
                        <Button variant="outline" size="sm" className="bg-transparent">
                          Create Ticket
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resource Configuration</CardTitle>
              <CardDescription>Current configuration settings for this resource</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Instance Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Instance Type:</span>
                        <span className="font-mono">{String(configuration.instanceType ?? '')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">AMI ID:</span>
                        <span className="font-mono">{String(configuration.ami ?? '')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Key Pair:</span>
                        <span className="font-mono">{String(configuration.keyPair ?? '')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">IAM Role:</span>
                        <span className="font-mono">{String(configuration.iamRole ?? '')}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2">Network Configuration</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">VPC:</span>
                        <span className="font-mono">{String(configuration.vpc ?? '')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subnet:</span>
                        <span className="font-mono">{String(configuration.subnet ?? '')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Public IP:</span>
                        <span className="font-mono">{String(configuration.publicIp ?? '')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Private IP:</span>
                        <span className="font-mono">{String(configuration.privateIp ?? '')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                    <div className="space-y-4">
                      {Array.isArray(configuration?.securityGroups) && configuration.securityGroups.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Security Groups</h4>
                          <div className="space-y-2">
                            {configuration.securityGroups.map((sg: any) => (
                              <div key={String(sg)} className="flex items-center justify-between p-2 border rounded">
                                <span className="font-mono text-sm">{String(sg)}</span>
                                <Button variant="outline" size="sm" className="bg-transparent">
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <Separator />

                      <div>
                        <h4 className="font-medium mb-2">Configuration</h4>
                        <div className="space-y-2 text-sm">
                          {Object.entries(configuration).filter(([k]) => k !== 'securityGroups').map(([key, val]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-muted-foreground">{key}:</span>
                              <span className="font-mono">
                                {typeof val === 'boolean' ? (val ? 'enabled' : 'disabled') : String(val ?? '')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metadata" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resource Metadata</CardTitle>
              <CardDescription>Tags and additional metadata for this resource</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-4 flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Resource Tags
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries((resourceData.tags || {}) as Record<string, string>).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium text-sm">{key}</div>
                          <div className="text-sm text-muted-foreground">{value}</div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(`${key}=${value}`)}
                          className="gap-2 bg-transparent"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-4">Lifecycle Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 border rounded-lg">
                      <div className="text-sm text-muted-foreground">Created</div>
                      <div className="font-medium">{metadata.created ? new Date(metadata.created).toLocaleString() : ''}</div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="text-sm text-muted-foreground">Last Modified</div>
                      <div className="font-medium">{resourceData.last_backup ? new Date(resourceData.last_backup).toLocaleString() : ''}</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
