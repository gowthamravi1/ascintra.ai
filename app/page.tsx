"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Shield, ArrowRight, CheckCircle, BarChart3, Users, Zap, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/lib/auth"

export default function HomePage() {
  const [loginOpen, setLoginOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [selectedRole, setSelectedRole] = useState<"admin" | "user">("user")
  const [error, setError] = useState("")
  const { login, loading } = useAuth()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("Please enter both email and password")
      return
    }

    const success = await login(email, password, selectedRole)
    if (!success) {
      setError("Invalid credentials. Please try again.")
    } else {
      setLoginOpen(false)
      setEmail("")
      setPassword("")
      setError("")
    }
  }

  const LoginDialog = () => (
    <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600">
              <Shield className="h-5 w-5 text-white" />
            </div>
            Sign in to Ascintra.ai
          </DialogTitle>
          <DialogDescription>Access your Cloud Recovery Posture Management platform</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}

          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={loading} onClick={() => setSelectedRole("user")}>
              {loading ? "Signing in..." : "Login as User"}
            </Button>
            <Button
              type="submit"
              variant="outline"
              className="flex-1 bg-transparent"
              disabled={loading}
              onClick={() => setSelectedRole("admin")}
            >
              {loading ? "Signing in..." : "Login as Admin"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">Ascintra.ai</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="#features" className="text-gray-600 hover:text-gray-900">
                Features
              </Link>
              <Link href="#solutions" className="text-gray-600 hover:text-gray-900">
                Solutions
              </Link>
              <Link href="#pricing" className="text-gray-600 hover:text-gray-900">
                Pricing
              </Link>
              <Link href="/roi-calculator" className="text-gray-600 hover:text-gray-900">
                ROI Calculator
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">Sign In</Button>
                </DialogTrigger>
                <LoginDialog />
              </Dialog>
              <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
                <DialogTrigger asChild>
                  <Button>Get Started</Button>
                </DialogTrigger>
                <LoginDialog />
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-100">
              Cloud Recovery Posture Management
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Secure Your Cloud
              <span className="text-blue-600"> Recovery Posture</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Advanced Cloud Recovery Posture Management (CRPM) platform that ensures enterprise resilience, compliance,
              and optimal recovery readiness across your entire cloud infrastructure.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="text-lg px-8 py-3">
                    Get Started <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <LoginDialog />
              </Dialog>
              <Link href="/roi-calculator">
                <Button variant="outline" size="lg" className="text-lg px-8 py-3 bg-transparent">
                  Calculate ROI
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Recovery Posture Management
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Monitor, assess, and optimize your cloud recovery capabilities with enterprise-grade CRPM solutions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Recovery Posture Scoring</CardTitle>
                <CardDescription>
                  Real-time assessment of your cloud recovery readiness with actionable insights and recommendations.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Compliance Automation</CardTitle>
                <CardDescription>
                  Automated compliance monitoring for SOC 2 Type II, DORA, ISO 27001, and other regulatory frameworks.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Recovery Analytics</CardTitle>
                <CardDescription>
                  Advanced analytics and reporting on RTO/RPO metrics, recovery trends, and infrastructure resilience.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle>Executive Dashboards</CardTitle>
                <CardDescription>
                  Role-based dashboards for CISOs, CIOs, and CloudOps teams with tailored insights and metrics.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle>Automated Testing</CardTitle>
                <CardDescription>
                  Continuous recovery testing and validation to ensure your backup and recovery processes work when
                  needed.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <Eye className="h-6 w-6 text-indigo-600" />
                </div>
                <CardTitle>Configuration Drift Detection</CardTitle>
                <CardDescription>
                  Monitor and detect configuration changes that could impact your recovery capabilities and compliance
                  posture.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Secure Your Cloud Recovery Posture?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join leading enterprises in implementing comprehensive Cloud Recovery Posture Management.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  variant="secondary"
                  className="text-lg px-8 py-3 bg-white text-blue-600 hover:bg-gray-100"
                >
                  Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </DialogTrigger>
              <LoginDialog />
            </Dialog>
            <Link href="/roi-calculator">
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8 py-3 border-white text-white hover:bg-white hover:text-blue-600 bg-transparent"
              >
                Calculate Your ROI
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <span className="ml-2 text-xl font-bold">Ascintra.ai</span>
              </div>
              <p className="text-gray-400">
                Advanced Cloud Recovery Posture Management for enterprise resilience and compliance.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#features" className="hover:text-white">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#solutions" className="hover:text-white">
                    Solutions
                  </Link>
                </li>
                <li>
                  <Link href="/roi-calculator" className="hover:text-white">
                    ROI Calculator
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="hover:text-white">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#about" className="hover:text-white">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#careers" className="hover:text-white">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#contact" className="hover:text-white">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="#blog" className="hover:text-white">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#docs" className="hover:text-white">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#help" className="hover:text-white">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#status" className="hover:text-white">
                    Status
                  </Link>
                </li>
                <li>
                  <Link href="#security" className="hover:text-white">
                    Security
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <Separator className="my-8 bg-gray-800" />
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">© 2024 Ascintra.ai. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="#privacy" className="text-gray-400 hover:text-white">
                Privacy Policy
              </Link>
              <Link href="#terms" className="text-gray-400 hover:text-white">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
