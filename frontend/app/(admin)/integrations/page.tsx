"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Settings, ExternalLink, Plus, CheckCircle, Clock, AlertCircle } from "lucide-react"

const integrations = [
  {
    id: 1,
    name: "Commvault",
    description: "Enterprise backup and recovery platform",
    status: "coming-soon",
    category: "Backup",
    logo: "🔄",
    connected: false,
  },
  {
    id: 2,
    name: "Veeam",
    description: "Backup, recovery and data management",
    status: "available",
    category: "Backup",
    logo: "💾",
    connected: true,
  },
  {
    id: 3,
    name: "AWS",
    description: "Amazon Web Services cloud platform",
    status: "available",
    category: "Cloud",
    logo: "☁️",
    connected: true,
  },
  {
    id: 4,
    name: "Azure",
    description: "Microsoft Azure cloud services",
    status: "available",
    category: "Cloud",
    logo: "🔵",
    connected: false,
  },
  {
    id: 5,
    name: "Webhook Templates",
    description: "Custom webhook integrations",
    status: "available",
    category: "Custom",
    logo: "🔗",
    connected: true,
  },
  {
    id: 6,
    name: "Slack",
    description: "Team communication and notifications",
    status: "available",
    category: "Notifications",
    logo: "💬",
    connected: true,
  },
]

export default function IntegrationsPage() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <Badge variant="success">Available</Badge>
      case "coming-soon":
        return <Badge variant="warning">Coming Soon</Badge>
      case "deprecated":
        return <Badge variant="secondary">Deprecated</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const getStatusIcon = (status: string, connected: boolean) => {
    if (status === "coming-soon") return <Clock className="h-4 w-4 text-warning" />
    if (connected) return <CheckCircle className="h-4 w-4 text-success" />
    return <AlertCircle className="h-4 w-4 text-muted-foreground" />
  }

  const categories = Array.from(new Set(integrations.map((i) => i.category)))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Integrations Hub</h1>
          <p className="text-muted-foreground">Connect RecoveryVault with your existing tools and services</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Request Integration
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Integrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{integrations.length}</div>
            <p className="text-xs text-muted-foreground">Available platforms</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Connected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{integrations.filter((i) => i.connected).length}</div>
            <p className="text-xs text-muted-foreground">Active connections</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">Integration types</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Coming Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {integrations.filter((i) => i.status === "coming-soon").length}
            </div>
            <p className="text-xs text-muted-foreground">In development</p>
          </CardContent>
        </Card>
      </div>

      {categories.map((category) => (
        <div key={category} className="space-y-4">
          <h2 className="text-xl font-semibold">{category}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrations
              .filter((integration) => integration.category === category)
              .map((integration) => (
                <Card key={integration.id} className="relative">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{integration.logo}</div>
                        <div>
                          <CardTitle className="text-lg">{integration.name}</CardTitle>
                          <CardDescription>{integration.description}</CardDescription>
                        </div>
                      </div>
                      {getStatusIcon(integration.status, integration.connected)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      {getStatusBadge(integration.status)}
                      <div className="flex gap-2">
                        {integration.status === "available" && (
                          <>
                            <Button variant="outline" size="sm">
                              <Settings className="h-4 w-4 mr-2" />
                              Configure
                            </Button>
                            <Button variant="outline" size="sm">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Docs
                            </Button>
                          </>
                        )}
                        {integration.status === "coming-soon" && (
                          <Button variant="outline" size="sm" disabled>
                            <Clock className="h-4 w-4 mr-2" />
                            Coming Soon
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}
