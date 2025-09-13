"use client"

import { useState } from "react"
import {
  Globe,
  Grid,
  TreePine,
  Filter,
  RotateCcw,
  Play,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Server,
  Database,
  HardDrive,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
  DrawerFooter,
} from "@/components/ui/drawer"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScoreGauge } from "@/components/ui/score-gauge"

// Mock data for AWS regions
const awsRegions = [
  {
    id: "us-east-1",
    name: "US East (N. Virginia)",
    score: "A",
    percentage: 92,
    position: { x: 280, y: 180 },
    uncovered: { ec2: 2, rds: 0, s3: 1 },
    resources: [
      {
        id: "i-1234567890abcdef0",
        service: "EC2",
        rpoCompliant: true,
        rtoCompliant: false,
        lastSnapshot: "2024-01-15 14:30",
      },
      { id: "db-instance-1", service: "RDS", rpoCompliant: true, rtoCompliant: true, lastSnapshot: "2024-01-15 16:00" },
      {
        id: "bucket-prod-data",
        service: "S3",
        rpoCompliant: false,
        rtoCompliant: true,
        lastSnapshot: "2024-01-15 12:00",
      },
    ],
  },
  {
    id: "us-west-2",
    name: "US West (Oregon)",
    score: "B",
    percentage: 84,
    position: { x: 120, y: 160 },
    uncovered: { ec2: 4, rds: 1, s3: 0 },
    resources: [
      {
        id: "i-0987654321fedcba0",
        service: "EC2",
        rpoCompliant: false,
        rtoCompliant: true,
        lastSnapshot: "2024-01-14 18:45",
      },
      {
        id: "db-west-primary",
        service: "RDS",
        rpoCompliant: true,
        rtoCompliant: false,
        lastSnapshot: "2024-01-15 10:30",
      },
    ],
  },
  {
    id: "eu-west-1",
    name: "Europe (Ireland)",
    score: "C",
    percentage: 76,
    position: { x: 480, y: 140 },
    uncovered: { ec2: 3, rds: 2, s3: 1 },
    resources: [
      {
        id: "i-eu1234567890abcdef",
        service: "EC2",
        rpoCompliant: true,
        rtoCompliant: true,
        lastSnapshot: "2024-01-15 09:15",
      },
      {
        id: "db-eu-backup",
        service: "RDS",
        rpoCompliant: false,
        rtoCompliant: false,
        lastSnapshot: "2024-01-13 22:00",
      },
    ],
  },
  {
    id: "ap-south-1",
    name: "Asia Pacific (Mumbai)",
    score: "D",
    percentage: 68,
    position: { x: 620, y: 220 },
    uncovered: { ec2: 6, rds: 3, s3: 2 },
    resources: [
      {
        id: "i-ap1234567890abcdef",
        service: "EC2",
        rpoCompliant: false,
        rtoCompliant: false,
        lastSnapshot: "2024-01-12 14:20",
      },
      {
        id: "db-mumbai-prod",
        service: "RDS",
        rpoCompliant: true,
        rtoCompliant: false,
        lastSnapshot: "2024-01-15 11:45",
      },
    ],
  },
  {
    id: "ap-northeast-1",
    name: "Asia Pacific (Tokyo)",
    score: "B",
    percentage: 88,
    position: { x: 720, y: 180 },
    uncovered: { ec2: 1, rds: 1, s3: 0 },
    resources: [
      {
        id: "i-jp1234567890abcdef",
        service: "EC2",
        rpoCompliant: true,
        rtoCompliant: true,
        lastSnapshot: "2024-01-15 13:30",
      },
      {
        id: "db-tokyo-replica",
        service: "RDS",
        rpoCompliant: true,
        rtoCompliant: false,
        lastSnapshot: "2024-01-15 15:00",
      },
    ],
  },
  {
    id: "sa-east-1",
    name: "South America (São Paulo)",
    score: "F",
    percentage: 45,
    position: { x: 320, y: 340 },
    uncovered: { ec2: 8, rds: 4, s3: 3 },
    resources: [
      {
        id: "i-sa1234567890abcdef",
        service: "EC2",
        rpoCompliant: false,
        rtoCompliant: false,
        lastSnapshot: "2024-01-10 16:30",
      },
      {
        id: "db-sao-paulo",
        service: "RDS",
        rpoCompliant: false,
        rtoCompliant: false,
        lastSnapshot: "2024-01-11 09:15",
      },
    ],
  },
]

function getScoreColor(score: string) {
  switch (score) {
    case "A":
      return "bg-green-500"
    case "B":
      return "bg-emerald-400"
    case "C":
      return "bg-yellow-400"
    case "D":
      return "bg-orange-500"
    case "F":
      return "bg-red-500"
    default:
      return "bg-gray-400"
  }
}

function getScoreBadgeVariant(score: string) {
  switch (score) {
    case "A":
      return "default"
    case "B":
      return "secondary"
    case "C":
      return "outline"
    case "D":
      return "destructive"
    case "F":
      return "destructive"
    default:
      return "secondary"
  }
}

function WorldMapView() {
  const [selectedRegion, setSelectedRegion] = useState<(typeof awsRegions)[0] | null>(null)
  const [hoveredRegion, setHoveredRegion] = useState<(typeof awsRegions)[0] | null>(null)

  return (
    <div className="relative">
      {/* World Map SVG */}
      <div
        className="relative bg-slate-50 dark:bg-slate-900 rounded-lg border overflow-hidden"
        style={{ height: "500px" }}
      >
        <svg viewBox="0 0 800 400" className="w-full h-full">
          {/* Simple world map outline */}
          <rect width="800" height="400" fill="currentColor" className="text-slate-100 dark:text-slate-800" />

          {/* Continents (simplified shapes) */}
          <path
            d="M100 120 L300 120 L320 200 L280 280 L120 260 Z"
            fill="currentColor"
            className="text-slate-200 dark:text-slate-700"
          />
          <path
            d="M450 100 L650 110 L680 180 L620 240 L480 220 Z"
            fill="currentColor"
            className="text-slate-200 dark:text-slate-700"
          />
          <path
            d="M200 300 L400 290 L420 360 L250 370 Z"
            fill="currentColor"
            className="text-slate-200 dark:text-slate-700"
          />
          <path
            d="M680 160 L750 150 L780 220 L720 250 Z"
            fill="currentColor"
            className="text-slate-200 dark:text-slate-700"
          />

          {/* AWS Region Nodes */}
          {awsRegions.map((region) => (
            <g key={region.id}>
              <circle
                cx={region.position.x}
                cy={region.position.y}
                r="12"
                className={`${getScoreColor(region.score)} cursor-pointer transition-all hover:scale-110`}
                onClick={() => setSelectedRegion(region)}
                onMouseEnter={() => setHoveredRegion(region)}
                onMouseLeave={() => setHoveredRegion(null)}
              />
              <text
                x={region.position.x}
                y={region.position.y + 5}
                textAnchor="middle"
                className="text-xs font-bold fill-white pointer-events-none"
              >
                {region.score}
              </text>
            </g>
          ))}
        </svg>

        {/* Tooltip */}
        {hoveredRegion && (
          <div
            className="absolute bg-black/90 text-white p-3 rounded-lg text-sm pointer-events-none z-10"
            style={{
              left: hoveredRegion.position.x + 20,
              top: hoveredRegion.position.y - 60,
            }}
          >
            <div className="font-semibold">Region: {hoveredRegion.id}</div>
            <div>
              Score: {hoveredRegion.score} ({hoveredRegion.percentage}%)
            </div>
            <div>
              Uncovered Resources: {hoveredRegion.uncovered.ec2} EC2, {hoveredRegion.uncovered.rds} RDS
            </div>
          </div>
        )}
      </div>

      {/* Region Detail Drawer */}
      {selectedRegion && (
        <Drawer open={!!selectedRegion} onOpenChange={() => setSelectedRegion(null)}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle className="flex items-center gap-3">
                <MapPin className="h-5 w-5" />
                <span>Region: {selectedRegion.id}</span>
                <Badge variant={getScoreBadgeVariant(selectedRegion.score)} className="text-lg px-3 py-1">
                  {selectedRegion.score}
                </Badge>
              </DrawerTitle>
              <DrawerDescription>
                {selectedRegion.name} • Score: {selectedRegion.score} ({selectedRegion.percentage}%) • Uncovered
                Resources: {selectedRegion.uncovered.ec2} EC2, {selectedRegion.uncovered.rds} RDS
              </DrawerDescription>
            </DrawerHeader>
            <div className="p-6">
              <h4 className="font-semibold mb-3">Failing Services/Resources</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Resource ID</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>RPO/RTO Compliance</TableHead>
                    <TableHead>Last Snapshot</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedRegion.resources.map((resource) => (
                    <TableRow key={resource.id}>
                      <TableCell className="font-mono text-sm">{resource.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {resource.service === "EC2" && <Server className="h-4 w-4" />}
                          {resource.service === "RDS" && <Database className="h-4 w-4" />}
                          {resource.service === "S3" && <HardDrive className="h-4 w-4" />}
                          <span>{resource.service}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {resource.rpoCompliant && resource.rtoCompliant ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className="text-sm">
                            {resource.rpoCompliant && resource.rtoCompliant ? "Compliant" : "Non-compliant"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {resource.lastSnapshot}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <DrawerFooter>
              <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 bg-transparent">
                <Play className="h-4 w-4 mr-2" />
                Simulate Recovery
              </Button>
              <DrawerClose asChild>
                <Button variant="outline">Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  )
}

function GridView() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {awsRegions.map((region) => (
        <Card key={region.id} className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{region.id}</CardTitle>
              <Badge variant={getScoreBadgeVariant(region.score)} className="text-lg px-3 py-1">
                {region.score}
              </Badge>
            </div>
            <CardDescription>{region.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Posture Score</span>
                <span className="font-semibold">{region.percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getScoreColor(region.score)}`}
                  style={{ width: `${region.percentage}%` }}
                />
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-red-500">{region.uncovered.ec2}</div>
                  <div className="text-muted-foreground">EC2</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-red-500">{region.uncovered.rds}</div>
                  <div className="text-muted-foreground">RDS</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-red-500">{region.uncovered.s3}</div>
                  <div className="text-muted-foreground">S3</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function TreeView() {
  return (
    <div className="space-y-4">
      {awsRegions.map((region) => (
        <Card key={region.id}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${getScoreColor(region.score)}`} />
                <div>
                  <CardTitle className="text-lg">{region.id}</CardTitle>
                  <CardDescription>{region.name}</CardDescription>
                </div>
              </div>
              <Badge variant={getScoreBadgeVariant(region.score)} className="text-lg px-3 py-1">
                {region.score} ({region.percentage}%)
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="ml-7 space-y-2">
              {region.resources.map((resource) => (
                <div key={resource.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs">
                      {resource.service}
                    </Badge>
                    <span className="font-mono text-sm">{resource.id}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {resource.rpoCompliant ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    {resource.rtoCompliant ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function PostureMapView() {
  const [filters, setFilters] = useState({
    account: "",
    service: "",
    threshold: "",
  })

  const handleApplyFilters = () => {
    console.log("Applying filters:", filters)
  }

  const handleResetFilters = () => {
    setFilters({ account: "", service: "", threshold: "" })
  }

  // Calculate global posture score
  const globalScore = Math.round(awsRegions.reduce((acc, region) => acc + region.percentage, 0) / awsRegions.length)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Global Recovery Posture Map</h1>
        <p className="text-muted-foreground mt-2">Visualize recovery readiness across AWS regions.</p>
      </div>

      {/* Filter Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>

            <Select
              value={filters.account}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, account: value }))}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="AWS Account" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="prod">Production (123456789012)</SelectItem>
                <SelectItem value="staging">Staging (123456789013)</SelectItem>
                <SelectItem value="dev">Development (123456789014)</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.service}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, service: value }))}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ec2">EC2</SelectItem>
                <SelectItem value="rds">RDS</SelectItem>
                <SelectItem value="s3">S3</SelectItem>
                <SelectItem value="ebs">EBS</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.threshold}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, threshold: value }))}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Score Threshold" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A">A Grade Only</SelectItem>
                <SelectItem value="B">B Grade & Above</SelectItem>
                <SelectItem value="C">C Grade & Above</SelectItem>
                <SelectItem value="D">D Grade & Above</SelectItem>
                <SelectItem value="F">All Grades</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2 ml-auto">
              <Button onClick={handleApplyFilters} className="bg-blue-600 hover:bg-blue-700">
                Apply Filters
              </Button>
              <Button variant="outline" onClick={handleResetFilters}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content with Tabs */}
      <Tabs defaultValue="world" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="world" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />🌍 World Map
          </TabsTrigger>
          <TabsTrigger value="grid" className="flex items-center gap-2">
            <Grid className="h-4 w-4" />🧮 Grid View
          </TabsTrigger>
          <TabsTrigger value="tree" className="flex items-center gap-2">
            <TreePine className="h-4 w-4" />📊 Tree View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="world" className="space-y-6">
          <WorldMapView />
        </TabsContent>

        <TabsContent value="grid" className="space-y-6">
          <GridView />
        </TabsContent>

        <TabsContent value="tree" className="space-y-6">
          <TreeView />
        </TabsContent>
      </Tabs>

      {/* Global Posture Score */}
      <Card>
        <CardHeader>
          <CardTitle>Global Recovery Posture Score</CardTitle>
          <CardDescription>Overall recovery readiness across all AWS regions</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <ScoreGauge score={globalScore} size="lg" />
        </CardContent>
      </Card>
    </div>
  )
}
