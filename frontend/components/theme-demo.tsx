"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScoreGauge } from "@/components/ui/score-gauge"
import { HeatCell } from "@/components/ui/heat-cell"

export function ThemeDemo() {
  return (
    <div className="p-8 space-y-8 bg-background min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-foreground mb-2">RecoveryVault</h1>
        <p className="text-muted-foreground mb-8">SaaS Theme Showcase</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card Demo */}
          <Card>
            <CardHeader>
              <CardTitle>Recovery Progress</CardTitle>
              <CardDescription>Your journey overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ScoreGauge value={75} label="Progress" />
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="success">Active</Badge>
                  <Badge variant="warning">Pending</Badge>
                  <Badge variant="critical">Critical</Badge>
                  <Badge variant="info">Info</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Heat Map Demo */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Heatmap</CardTitle>
              <CardDescription>Daily engagement levels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 35 }, (_, i) => (
                  <HeatCell key={i} value={Math.random()} colorScheme="success" size="sm" />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Metrics Demo */}
          <Card>
            <CardHeader>
              <CardTitle>Key Metrics</CardTitle>
              <CardDescription>Performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Completion Rate</span>
                  <Badge variant="success">92%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Risk Level</span>
                  <Badge variant="warning">Medium</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Alerts</span>
                  <Badge variant="critical">3</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Color Palette Demo */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Color Palette</CardTitle>
            <CardDescription>RecoveryVault brand colors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="w-full h-12 bg-primary rounded"></div>
                <p className="text-sm font-medium">Primary</p>
              </div>
              <div className="space-y-2">
                <div className="w-full h-12 bg-accent rounded"></div>
                <p className="text-sm font-medium">Accent</p>
              </div>
              <div className="space-y-2">
                <div className="w-full h-12 bg-success rounded"></div>
                <p className="text-sm font-medium">Success</p>
              </div>
              <div className="space-y-2">
                <div className="w-full h-12 bg-critical rounded"></div>
                <p className="text-sm font-medium">Critical</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
