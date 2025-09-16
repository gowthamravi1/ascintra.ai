"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Filter, Eye, ExternalLink } from "lucide-react"

type Resource = {
  id: string
  type: string
  region: string
  tags: string[]
  lastChange?: string
  findings?: number
  severity: "critical" | "high" | "medium" | "low" | "none"
}

const fallbackResources: Resource[] = [
  {
    id: "i-0123456789abcdef0",
    type: "EC2 Instance",
    region: "us-east-1",
    tags: ["Environment:Production", "Team:Backend"],
    lastChange: "2 hours ago",
    findings: 3,
    severity: "high",
  },
  {
    id: "sg-0987654321fedcba0",
    type: "Security Group",
    region: "us-east-1",
    tags: ["Environment:Production"],
    lastChange: "1 day ago",
    findings: 1,
    severity: "critical",
  },
  {
    id: "bucket-prod-data-2024",
    type: "S3 Bucket",
    region: "us-east-1",
    tags: ["Environment:Production", "DataClass:Sensitive"],
    lastChange: "3 hours ago",
    findings: 0,
    severity: "none",
  },
  {
    id: "rds-prod-mysql-01",
    type: "RDS Instance",
    region: "us-west-2",
    tags: ["Environment:Production", "Database:MySQL"],
    lastChange: "5 hours ago",
    findings: 2,
    severity: "medium",
  },
  {
    id: "lambda-api-handler",
    type: "Lambda Function",
    region: "us-east-1",
    tags: ["Environment:Production", "Team:API"],
    lastChange: "1 hour ago",
    findings: 1,
    severity: "low",
  },
]

const resourceTypes = ["All Types", "EC2 Instance", "Security Group", "S3 Bucket", "RDS Instance", "Lambda Function"]
const regions = ["All Regions", "us-east-1", "us-west-2", "eu-west-1"]
const severities = ["All Severities", "Critical", "High", "Medium", "Low", "None"]

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("All Types")
  const [selectedRegion, setSelectedRegion] = useState("All Regions")
  const [selectedSeverity, setSelectedSeverity] = useState("All Severities")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [resourcesData, setResourcesData] = useState<Resource[]>(fallbackResources)

  const allTags = Array.from(new Set(resourcesData.flatMap((r) => r.tags)))

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/tenant/inventory", { cache: "no-store" })
        if (!res.ok) return
        const data = await res.json()
        const items = Array.isArray(data?.items) ? data.items : []
        const mapped: Resource[] = items.map((it: any) => ({
          id: String(it.id ?? ""),
          type: String(it.type ?? "unknown"),
          region: String(it.region ?? "unknown"),
          tags: Object.entries(it.tags ?? {}).map(([k, v]) => `${k}:${v}`),
          severity: "none",
        }))
        if (mapped.length) setResourcesData(mapped)
      } catch (e) {
        // ignore
      }
    }
    load()
  }, [])

  const filteredResources = resourcesData.filter((resource) => {
    const matchesSearch =
      resource.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === "All Types" || resource.type === selectedType
    const matchesRegion = selectedRegion === "All Regions" || resource.region === selectedRegion
    const matchesSeverity =
      selectedSeverity === "All Severities" || selectedSeverity.toLowerCase() === resource.severity
    const matchesTags = selectedTags.length === 0 || selectedTags.some((tag) => resource.tags.includes(tag))

    return matchesSearch && matchesType && matchesRegion && matchesSeverity && matchesTags
  })

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
      case "none":
        return "success"
      default:
        return "secondary"
    }
  }

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Resource Inventory</h1>
          <p className="text-muted-foreground">Explore and manage your cloud resources</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Resource Type Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Resource Type</label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {resourceTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Region Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Region</label>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Severity Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Severity</label>
              <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {severities.map((severity) => (
                    <SelectItem key={severity} value={severity}>
                      {severity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tags Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tags</label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {allTags.map((tag) => (
                  <div key={tag} className="flex items-center space-x-2">
                    <Checkbox
                      id={tag}
                      checked={selectedTags.includes(tag)}
                      onCheckedChange={() => handleTagToggle(tag)}
                    />
                    <label htmlFor={tag} className="text-sm cursor-pointer">
                      {tag}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={() => {
                setSelectedType("All Types")
                setSelectedRegion("All Regions")
                setSelectedSeverity("All Severities")
                setSelectedTags([])
                setSearchTerm("")
              }}
            >
              Clear All Filters
            </Button>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Search and Stats */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search resources by ID or type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" className="gap-2 bg-transparent">
                  <Filter className="h-4 w-4" />
                  Export
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{filteredResources.length}</div>
                  <div className="text-sm text-muted-foreground">Total Resources</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-critical">
                    {filteredResources.filter((r) => r.severity === "critical" || r.severity === "high").length}
                  </div>
                  <div className="text-sm text-muted-foreground">High Risk</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-warning">
                    {filteredResources.filter((r) => r.severity === "medium").length}
                  </div>
                  <div className="text-sm text-muted-foreground">Medium Risk</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-success">
                    {filteredResources.filter((r) => r.severity === "none").length}
                  </div>
                  <div className="text-sm text-muted-foreground">Secure</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resources Table */}
          <Card>
            <CardHeader>
              <CardTitle>Resources</CardTitle>
              <CardDescription>
                Showing {filteredResources.length} of {resourcesData.length} resources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Resource ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Last Change</TableHead>
                    <TableHead>Findings</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResources.map((resource) => (
                    <TableRow key={resource.id}>
                      <TableCell className="font-mono text-sm">{resource.id}</TableCell>
                      <TableCell>{resource.type}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{resource.region}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {resource.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {resource.tags.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{resource.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{resource.lastChange}</TableCell>
                      <TableCell>
                        {resource.findings > 0 ? (
                          <Badge variant={getSeverityBadgeVariant(resource.severity)}>
                            {resource.findings} finding{resource.findings !== 1 ? "s" : ""}
                          </Badge>
                        ) : (
                          <Badge variant="success">No findings</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
