"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, ArrowRight, Check } from "lucide-react"

const steps = [
  { id: 1, title: "Basic Information", description: "Tenant name and plan selection" },
  { id: 2, title: "Region Selection", description: "Choose deployment regions" },
  { id: 3, title: "Review & Confirm", description: "Review configuration before provisioning" },
]

const regions = [
  { id: "us-east-1", name: "US East (N. Virginia)", flag: "🇺🇸" },
  { id: "us-west-2", name: "US West (Oregon)", flag: "🇺🇸" },
  { id: "eu-west-1", name: "Europe (Ireland)", flag: "🇪🇺" },
  { id: "ap-southeast-1", name: "Asia Pacific (Singapore)", flag: "🇸🇬" },
  { id: "ap-northeast-1", name: "Asia Pacific (Tokyo)", flag: "🇯🇵" },
]

export default function ProvisionTenantPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    tenantName: "",
    plan: "",
    selectedRegions: [] as string[],
  })

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleRegionToggle = (regionId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedRegions: prev.selectedRegions.includes(regionId)
        ? prev.selectedRegions.filter((id) => id !== regionId)
        : [...prev.selectedRegions, regionId],
    }))
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.tenantName && formData.plan
      case 2:
        return formData.selectedRegions.length > 0
      case 3:
        return true
      default:
        return false
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tenants
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Provision New Tenant</h1>
          <p className="text-muted-foreground">Set up a new tenant account</p>
        </div>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex items-center">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                      currentStep > step.id
                        ? "bg-primary border-primary text-primary-foreground"
                        : currentStep === step.id
                          ? "border-primary text-primary"
                          : "border-muted-foreground text-muted-foreground"
                    }`}
                  >
                    {currentStep > step.id ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <span className="text-sm font-medium">{step.id}</span>
                    )}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">{step.title}</p>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`mx-8 h-0.5 w-16 ${currentStep > step.id ? "bg-primary" : "bg-muted"}`} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep - 1].title}</CardTitle>
          <CardDescription>{steps[currentStep - 1].description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tenantName">Tenant Name</Label>
                <Input
                  id="tenantName"
                  placeholder="Enter tenant name"
                  value={formData.tenantName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, tenantName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan">Plan</Label>
                <Select
                  value={formData.plan}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, plan: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free - $0/month</SelectItem>
                    <SelectItem value="pro">Pro - $99/month</SelectItem>
                    <SelectItem value="enterprise">Enterprise - $299/month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <Label>Select Deployment Regions</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Choose one or more regions where the tenant's data will be stored
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {regions.map((region) => (
                  <div key={region.id} className="flex items-center space-x-3 p-4 border rounded-lg">
                    <Checkbox
                      id={region.id}
                      checked={formData.selectedRegions.includes(region.id)}
                      onCheckedChange={() => handleRegionToggle(region.id)}
                    />
                    <div className="flex-1">
                      <Label htmlFor={region.id} className="flex items-center gap-2 cursor-pointer">
                        <span className="text-lg">{region.flag}</span>
                        <span>{region.name}</span>
                      </Label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Basic Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tenant Name:</span>
                      <span className="font-medium">{formData.tenantName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Plan:</span>
                      <span className="font-medium capitalize">{formData.plan}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-medium">Deployment Regions</h3>
                  <div className="space-y-2">
                    {formData.selectedRegions.map((regionId) => {
                      const region = regions.find((r) => r.id === regionId)
                      return (
                        <div key={regionId} className="flex items-center gap-2">
                          <span>{region?.flag}</span>
                          <span className="text-sm">{region?.name}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> Provisioning typically takes 5-10 minutes. You'll receive an email notification
                  once the tenant is ready.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <Button
          onClick={currentStep === steps.length ? () => console.log("Provision tenant") : handleNext}
          disabled={!canProceed()}
        >
          {currentStep === steps.length ? "Provision Tenant" : "Next"}
          {currentStep < steps.length && <ArrowRight className="h-4 w-4 ml-2" />}
        </Button>
      </div>
    </div>
  )
}
