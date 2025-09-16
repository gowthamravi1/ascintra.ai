"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Calculator,
  TrendingUp,
  DollarSign,
  Clock,
  Shield,
  FileCheck,
  AlertTriangle,
  Download,
  Share2,
  ArrowLeft,
  Target,
  Zap,
  BarChart3,
} from "lucide-react"
import Link from "next/link"

interface ROIInputs {
  // Current State
  annualRevenue: number
  downtimeHoursPerYear: number
  averageDowntimeCostPerHour: number
  complianceAuditCosts: number
  complianceStaffCosts: number
  currentRecoveryTestingCosts: number

  // CRPM Implementation
  crpmLicenseCost: number
  implementationCost: number
  trainingCost: number

  // Expected Improvements
  downtimeReductionPercent: number
  complianceEfficiencyGain: number
  recoveryTestingEfficiency: number
}

interface ROIResults {
  currentAnnualCosts: number
  crpmAnnualCosts: number
  annualSavings: number
  threeYearSavings: number
  roi: number
  paybackPeriod: number
  complianceSavings: number
  downtimeSavings: number
  efficiencySavings: number
}

export default function ROICalculatorPage() {
  const [inputs, setInputs] = useState<ROIInputs>({
    annualRevenue: 50000000,
    downtimeHoursPerYear: 24,
    averageDowntimeCostPerHour: 100000,
    complianceAuditCosts: 250000,
    complianceStaffCosts: 400000,
    currentRecoveryTestingCosts: 150000,
    crmpLicenseCost: 120000,
    implementationCost: 200000,
    trainingCost: 50000,
    downtimeReductionPercent: 60,
    complianceEfficiencyGain: 40,
    recoveryTestingEfficiency: 70,
  })

  const [results, setResults] = useState<ROIResults>({
    currentAnnualCosts: 0,
    crmpAnnualCosts: 0,
    annualSavings: 0,
    threeYearSavings: 0,
    roi: 0,
    paybackPeriod: 0,
    complianceSavings: 0,
    downtimeSavings: 0,
    efficiencySavings: 0,
  })

  useEffect(() => {
    calculateROI()
  }, [inputs])

  const calculateROI = () => {
    // Current annual costs
    const currentDowntimeCosts = inputs.downtimeHoursPerYear * inputs.averageDowntimeCostPerHour
    const currentComplianceCosts = inputs.complianceAuditCosts + inputs.complianceStaffCosts
    const currentTestingCosts = inputs.currentRecoveryTestingCosts
    const currentAnnualCosts = currentDowntimeCosts + currentComplianceCosts + currentTestingCosts

    // CRPM costs
    const crmpAnnualCosts = inputs.crmpLicenseCost
    const totalImplementationCost = inputs.implementationCost + inputs.trainingCost

    // Savings calculations
    const downtimeSavings = currentDowntimeCosts * (inputs.downtimeReductionPercent / 100)
    const complianceSavings = currentComplianceCosts * (inputs.complianceEfficiencyGain / 100)
    const efficiencySavings = currentTestingCosts * (inputs.recoveryTestingEfficiency / 100)

    const annualSavings = downtimeSavings + complianceSavings + efficiencySavings - crmpAnnualCosts
    const threeYearSavings = annualSavings * 3 - totalImplementationCost

    const roi = (threeYearSavings / (totalImplementationCost + crmpAnnualCosts * 3)) * 100
    const paybackPeriod = totalImplementationCost / annualSavings

    setResults({
      currentAnnualCosts,
      crmpAnnualCosts,
      annualSavings,
      threeYearSavings,
      roi,
      paybackPeriod,
      complianceSavings,
      downtimeSavings,
      efficiencySavings,
    })
  }

  const updateInput = (field: keyof ROIInputs, value: number) => {
    setInputs((prev) => ({ ...prev, [field]: value }))
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const formatYears = (years: number) => {
    if (years < 1) {
      return `${Math.round(years * 12)} months`
    }
    return `${years.toFixed(1)} years`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button asChild variant="ghost" size="sm">
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
              <div className="flex items-center space-x-2">
                <Calculator className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">CRPM ROI Calculator</h1>
              </div>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              Ascintra.ai
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Calculate Your CRPM ROI
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            Discover the financial impact of implementing Cloud Recovery Posture Management. Calculate potential savings
            from reduced downtime, improved compliance efficiency, and optimized recovery operations.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2 text-blue-600" />
                  ROI Calculator Inputs
                </CardTitle>
                <CardDescription>
                  Enter your organization's current costs and expected improvements with CRPM
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="current" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="current">Current State</TabsTrigger>
                    <TabsTrigger value="crpm">CRPM Costs</TabsTrigger>
                    <TabsTrigger value="improvements">Expected Benefits</TabsTrigger>
                  </TabsList>

                  <TabsContent value="current" className="space-y-6 mt-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="annualRevenue">Annual Revenue</Label>
                        <Input
                          id="annualRevenue"
                          type="number"
                          value={inputs.annualRevenue}
                          onChange={(e) => updateInput("annualRevenue", Number(e.target.value))}
                          placeholder="50000000"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="downtimeHours">Downtime Hours/Year</Label>
                        <Input
                          id="downtimeHours"
                          type="number"
                          value={inputs.downtimeHoursPerYear}
                          onChange={(e) => updateInput("downtimeHoursPerYear", Number(e.target.value))}
                          placeholder="24"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="downtimeCost">Downtime Cost/Hour</Label>
                        <Input
                          id="downtimeCost"
                          type="number"
                          value={inputs.averageDowntimeCostPerHour}
                          onChange={(e) => updateInput("averageDowntimeCostPerHour", Number(e.target.value))}
                          placeholder="100000"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="auditCosts">Annual Compliance Audit Costs</Label>
                        <Input
                          id="auditCosts"
                          type="number"
                          value={inputs.complianceAuditCosts}
                          onChange={(e) => updateInput("complianceAuditCosts", Number(e.target.value))}
                          placeholder="250000"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="staffCosts">Compliance Staff Costs</Label>
                        <Input
                          id="staffCosts"
                          type="number"
                          value={inputs.complianceStaffCosts}
                          onChange={(e) => updateInput("complianceStaffCosts", Number(e.target.value))}
                          placeholder="400000"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="testingCosts">Recovery Testing Costs</Label>
                        <Input
                          id="testingCosts"
                          type="number"
                          value={inputs.currentRecoveryTestingCosts}
                          onChange={(e) => updateInput("currentRecoveryTestingCosts", Number(e.target.value))}
                          placeholder="150000"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="crpm" className="space-y-6 mt-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="licenseCost">Annual CRPM License Cost</Label>
                        <Input
                          id="licenseCost"
                          type="number"
                          value={inputs.crmpLicenseCost}
                          onChange={(e) => updateInput("crmpLicenseCost", Number(e.target.value))}
                          placeholder="120000"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="implementationCost">Implementation Cost</Label>
                        <Input
                          id="implementationCost"
                          type="number"
                          value={inputs.implementationCost}
                          onChange={(e) => updateInput("implementationCost", Number(e.target.value))}
                          placeholder="200000"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="trainingCost">Training Cost</Label>
                        <Input
                          id="trainingCost"
                          type="number"
                          value={inputs.trainingCost}
                          onChange={(e) => updateInput("trainingCost", Number(e.target.value))}
                          placeholder="50000"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="improvements" className="space-y-6 mt-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="downtimeReduction">Downtime Reduction (%)</Label>
                        <Input
                          id="downtimeReduction"
                          type="number"
                          value={inputs.downtimeReductionPercent}
                          onChange={(e) => updateInput("downtimeReductionPercent", Number(e.target.value))}
                          placeholder="60"
                          max="100"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="complianceEfficiency">Compliance Efficiency Gain (%)</Label>
                        <Input
                          id="complianceEfficiency"
                          type="number"
                          value={inputs.complianceEfficiencyGain}
                          onChange={(e) => updateInput("complianceEfficiencyGain", Number(e.target.value))}
                          placeholder="40"
                          max="100"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="testingEfficiency">Recovery Testing Efficiency (%)</Label>
                        <Input
                          id="testingEfficiency"
                          type="number"
                          value={inputs.recoveryTestingEfficiency}
                          onChange={(e) => updateInput("recoveryTestingEfficiency", Number(e.target.value))}
                          placeholder="70"
                          max="100"
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {/* ROI Summary */}
            <Card className="border-2 border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="flex items-center text-green-700 dark:text-green-400">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  ROI Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {formatPercent(results.roi)}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">3-Year ROI</div>
                </div>
                <Separator />
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Payback Period</span>
                    <span className="font-medium">{formatYears(results.paybackPeriod)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Annual Savings</span>
                    <span className="font-medium text-green-600">{formatCurrency(results.annualSavings)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">3-Year Savings</span>
                    <span className="font-medium text-green-600">{formatCurrency(results.threeYearSavings)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Savings Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                  Annual Savings Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                      <span className="text-sm">Downtime Reduction</span>
                    </div>
                    <span className="font-medium text-green-600">{formatCurrency(results.downtimeSavings)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileCheck className="h-4 w-4 mr-2 text-blue-500" />
                      <span className="text-sm">Compliance Efficiency</span>
                    </div>
                    <span className="font-medium text-green-600">{formatCurrency(results.complianceSavings)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Zap className="h-4 w-4 mr-2 text-purple-500" />
                      <span className="text-sm">Testing Efficiency</span>
                    </div>
                    <span className="font-medium text-green-600">{formatCurrency(results.efficiencySavings)}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-2 text-orange-500" />
                      <span className="text-sm">CRPM Annual Cost</span>
                    </div>
                    <span className="font-medium text-red-600">-{formatCurrency(results.crmpAnnualCosts)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Share Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-transparent" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download Report
                </Button>
                <Button className="w-full bg-transparent" variant="outline">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Calculator
                </Button>
                <Button asChild className="w-full">
                  <Link href="/tenant/overview">
                    <Shield className="h-4 w-4 mr-2" />
                    View CRPM Demo
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Detailed Analysis */}
        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle>Cost-Benefit Analysis</CardTitle>
              <CardDescription>Detailed breakdown of current costs vs. CRMP implementation benefits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold mb-4 flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-red-500" />
                    Current Annual Costs
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Downtime Costs</span>
                      <span className="font-medium">
                        {formatCurrency(inputs.downtimeHoursPerYear * inputs.averageDowntimeCostPerHour)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Compliance Costs</span>
                      <span className="font-medium">
                        {formatCurrency(inputs.complianceAuditCosts + inputs.complianceStaffCosts)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Recovery Testing</span>
                      <span className="font-medium">{formatCurrency(inputs.currentRecoveryTestingCosts)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total Annual Cost</span>
                      <span className="text-red-600">{formatCurrency(results.currentAnnualCosts)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-4 flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-green-500" />
                    CRPM Benefits
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Reduced Downtime</span>
                      <span className="font-medium text-green-600">+{formatCurrency(results.downtimeSavings)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Compliance Efficiency</span>
                      <span className="font-medium text-green-600">+{formatCurrency(results.complianceSavings)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Testing Automation</span>
                      <span className="font-medium text-green-600">+{formatCurrency(results.efficiencySavings)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">CRPM License</span>
                      <span className="font-medium text-red-600">-{formatCurrency(inputs.crmpLicenseCost)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Net Annual Benefit</span>
                      <span className="text-green-600">{formatCurrency(results.annualSavings)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Key Assumptions */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Key Assumptions & Benefits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h5 className="font-semibold mb-2 text-red-600">Downtime Reduction</h5>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>• Proactive monitoring reduces incidents</li>
                    <li>• Faster recovery with automated procedures</li>
                    <li>• Better RTO/RPO compliance</li>
                    <li>• Reduced human error</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-semibold mb-2 text-blue-600">Compliance Efficiency</h5>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>• Automated evidence collection</li>
                    <li>• Continuous compliance monitoring</li>
                    <li>• Reduced audit preparation time</li>
                    <li>• DORA/SOC2 framework alignment</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-semibold mb-2 text-purple-600">Operational Efficiency</h5>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>• Automated recovery testing</li>
                    <li>• Reduced manual processes</li>
                    <li>• Better resource utilization</li>
                    <li>• Improved team productivity</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
