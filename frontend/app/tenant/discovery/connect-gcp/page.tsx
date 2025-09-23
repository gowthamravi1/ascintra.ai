"use client"
import { useState } from "react"
import { CheckCircle, Shield, AlertCircle, Key, Database, Cloud, ArrowRight, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export default function ConnectGCPAccount() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isCreatingAccount, setIsCreatingAccount] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "connecting" | "success" | "error">("idle")
  const [projectId, setProjectId] = useState("")
  const [projectNumber, setProjectNumber] = useState("")
  const [serviceAccountEmail, setServiceAccountEmail] = useState("")
  const [serviceAccountJson, setServiceAccountJson] = useState("")
  const [accountName, setAccountName] = useState("")
  const [primaryRegion, setPrimaryRegion] = useState("")
  const [jsonError, setJsonError] = useState("")
  const [connectionDetails, setConnectionDetails] = useState<any>(null)
  const [discoveryFrequency, setDiscoveryFrequency] = useState("daily")
  const [preferredTime, setPreferredTime] = useState("02:00")

  const handleConnect = async () => {
    setIsConnecting(true)
    setConnectionStatus("connecting")
    try {
      let parsedJson
      try {
        parsedJson = JSON.parse(serviceAccountJson)
      } catch (e) {
        setJsonError("Invalid JSON format")
        setConnectionStatus("error")
        setIsConnecting(false)
        return
      }

      const res = await fetch("/api/accounts/test-connection", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          provider: "gcp",
          account_identifier: projectId,
          gcp_project_number: projectNumber,
          gcp_sa_email: serviceAccountEmail,
          credentials_json: { gcp: parsedJson },
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data?.ok) {
        setConnectionStatus("success")
        setConnectionDetails(data.details)
      } else {
        setConnectionStatus("error")
        setConnectionDetails(data.details)
      }
    } catch (e) {
      setConnectionStatus("error")
    } finally {
      setIsConnecting(false)
    }
  }

  const handleCreateAccount = async () => {
    setIsCreatingAccount(true)
    try {
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          provider: "gcp",
          account_identifier: projectId,
          name: accountName || projectId,
          primary_region: primaryRegion,
          gcp_project_number: projectNumber,
          gcp_sa_email: serviceAccountEmail,
          credentials_json: { gcp: JSON.parse(serviceAccountJson) },
          discovery_enabled: true,
          discovery_frequency: discoveryFrequency,
          preferred_time_utc: preferredTime,
        }),
      })
      
      if (res.ok) {
        toast.success("GCP account connected successfully!")
        router.push("/tenant/discovery/history")
      } else {
        toast.error("Failed to create account")
      }
    } catch (e) {
      toast.error("Failed to create account")
    } finally {
      setIsCreatingAccount(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Connect GCP Account
          </h1>
          <p className="text-gray-600 mt-2">
            Securely connect your Google Cloud Platform project to enable resource discovery and backup monitoring
          </p>
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          <Shield className="h-3 w-3 mr-1" />
          Secure Connection
        </Badge>
      </div>

      {currentStep === 1 && (
        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-600" />
              GCP Project Details
            </CardTitle>
            <CardDescription>Enter your Google Cloud Platform project information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="projectId" className="text-sm font-medium text-gray-700">
                    Project ID *
                  </Label>
                  <Input
                    id="projectId"
                    type="text"
                    placeholder="my-gcp-project"
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="projectNumber" className="text-sm font-medium text-gray-700">
                    Project Number
                  </Label>
                  <Input
                    id="projectNumber"
                    type="text"
                    placeholder="123456789012"
                    value={projectNumber}
                    onChange={(e) => setProjectNumber(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="accountName" className="text-sm font-medium text-gray-700">
                    Account Name
                  </Label>
                  <Input
                    id="accountName"
                    type="text"
                    placeholder="My GCP Project"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="primaryRegion" className="text-sm font-medium text-gray-700">
                    Primary Region
                  </Label>
                  <select
                    id="primaryRegion"
                    value={primaryRegion}
                    onChange={(e) => setPrimaryRegion(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Select a region</option>
                    <option value="us-central1">🇺🇸 US Central (Iowa)</option>
                    <option value="us-east1">🇺🇸 US East (South Carolina)</option>
                    <option value="us-west1">🇺🇸 US West (Oregon)</option>
                    <option value="europe-west1">🇪🇺 Europe West (Belgium)</option>
                    <option value="asia-southeast1">🇸🇬 Asia Southeast (Singapore)</option>
                  </select>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-900">Required Permissions</h4>
                      <p className="text-xs text-blue-700 mt-1">
                        Your service account needs: Compute Viewer, Cloud SQL Viewer, Storage Object Viewer, Cloud Resource Manager Viewer
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={() => setCurrentStep(2)}
                disabled={!projectId}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 2 && (
        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-blue-600" />
              Service Account Credentials
            </CardTitle>
            <CardDescription>Upload your GCP service account JSON key file</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="serviceAccountEmail" className="text-sm font-medium text-gray-700">
                    Service Account Email
                  </Label>
                  <Input
                    id="serviceAccountEmail"
                    type="email"
                    placeholder="service-account@project-id.iam.gserviceaccount.com"
                    value={serviceAccountEmail}
                    onChange={(e) => setServiceAccountEmail(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="serviceAccountJson" className="text-sm font-medium text-gray-700">
                    Service Account JSON *
                  </Label>
                  <Textarea
                    id="serviceAccountJson"
                    placeholder="Paste your service account JSON key here..."
                    value={serviceAccountJson}
                    onChange={(e) => {
                      setServiceAccountJson(e.target.value)
                      setJsonError("")
                    }}
                    className="mt-1 min-h-[200px] font-mono text-sm"
                  />
                  {jsonError && (
                    <p className="text-xs text-red-600 mt-1">{jsonError}</p>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-yellow-900">How to Create a Service Account</h4>
                      <ol className="text-xs text-yellow-800 mt-2 space-y-1 list-decimal list-inside">
                        <li>Go to the <a href="https://console.cloud.google.com/iam-admin/serviceaccounts" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">GCP Console</a></li>
                        <li>Select your project</li>
                        <li>Click "Create Service Account"</li>
                        <li>Assign the required roles</li>
                        <li>Click "Create Key" → "JSON"</li>
                        <li>Download and paste the JSON content here</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(1)}
              >
                Back
              </Button>
              <Button
                onClick={() => setCurrentStep(3)}
                disabled={!serviceAccountJson}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 3 && (
        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-blue-600" />
              Connection Test
            </CardTitle>
            <CardDescription>Verify your GCP credentials and connectivity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center py-8">
              {connectionStatus === "idle" && (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <Cloud className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Ready to Test Connection</h3>
                    <p className="text-gray-600">Click the button below to verify your GCP credentials</p>
                  </div>
                  <Button
                    onClick={handleConnect}
                    disabled={isConnecting}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    {isConnecting ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Testing Connection...
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4 mr-2" />
                        Test Connection
                      </>
                    )}
                  </Button>
                </div>
              )}

              {connectionStatus === "connecting" && (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Testing Connection</h3>
                    <p className="text-gray-600">Validating your GCP credentials...</p>
                  </div>
                  <Progress value={66} className="w-64 mx-auto" />
                </div>
              )}

              {connectionStatus === "success" && (
                <div className="space-y-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-green-900">Connection Successful!</h3>
                    <p className="text-green-600">Your GCP credentials are valid and working</p>
                  </div>
                  
                  {/* Service Account Details */}
                  {connectionDetails && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-green-900 mb-3">Service Account Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-green-800">Project ID:</span>
                          <span className="ml-2 text-green-700">{connectionDetails.project_id || projectId}</span>
                        </div>
                        <div>
                          <span className="font-medium text-green-800">Service Account:</span>
                          <span className="ml-2 text-green-700">{connectionDetails.service_account || serviceAccountEmail}</span>
                        </div>
                        {connectionDetails.project_name && (
                          <div>
                            <span className="font-medium text-green-800">Project Name:</span>
                            <span className="ml-2 text-green-700">{connectionDetails.project_name}</span>
                          </div>
                        )}
                        {connectionDetails.project_number && (
                          <div>
                            <span className="font-medium text-green-800">Project Number:</span>
                            <span className="ml-2 text-green-700">{connectionDetails.project_number}</span>
                          </div>
                        )}
                        {connectionDetails.project_state && (
                          <div>
                            <span className="font-medium text-green-800">Project State:</span>
                            <span className="ml-2 text-green-700">{connectionDetails.project_state}</span>
                          </div>
                        )}
                        {connectionDetails.accessible_projects && (
                          <div className="md:col-span-2">
                            <span className="font-medium text-green-800">Accessible Projects:</span>
                            <span className="ml-2 text-green-700">{connectionDetails.accessible_projects} projects</span>
                          </div>
                        )}
                      </div>
                      {connectionDetails.gcp_message && (
                        <div className="mt-3 p-2 bg-green-100 rounded text-xs text-green-800">
                          <strong>Message:</strong> {connectionDetails.gcp_message}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="flex justify-center gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep(2)}
                    >
                      Back
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(4)}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    >
                      Continue to Setup
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {connectionStatus === "error" && (
                <div className="space-y-6">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                    <AlertCircle className="h-8 w-8 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-red-900">Connection Failed</h3>
                    <p className="text-red-600">Please check your credentials and try again</p>
                  </div>
                  
                  {/* Error Details */}
                  {connectionDetails && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-red-900 mb-3">Error Details</h4>
                      <div className="text-sm text-red-800">
                        <div className="mb-2">
                          <span className="font-medium">Validation:</span> {connectionDetails.gcp_validation}
                        </div>
                        {connectionDetails.gcp_error && (
                          <div className="mb-2">
                            <span className="font-medium">Error:</span> {connectionDetails.gcp_error}
                          </div>
                        )}
                        {connectionDetails.project_id && (
                          <div>
                            <span className="font-medium">Project ID:</span> {connectionDetails.project_id}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-center gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep(2)}
                    >
                      Back to Credentials
                    </Button>
                    <Button
                      onClick={handleConnect}
                      className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700"
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 4 && (
        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="h-5 w-5 text-blue-600" />
              Account Setup & Discovery Configuration
            </CardTitle>
            <CardDescription>Configure discovery settings and create your GCP account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="discoveryFrequency" className="text-sm font-medium text-gray-700">
                    Discovery Frequency *
                  </Label>
                  <select
                    id="discoveryFrequency"
                    value={discoveryFrequency}
                    onChange={(e) => setDiscoveryFrequency(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="hourly">Every Hour</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="preferredTime" className="text-sm font-medium text-gray-700">
                    Preferred Discovery Time (UTC)
                  </Label>
                  <Input
                    id="preferredTime"
                    type="time"
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-900">What happens next?</h4>
                      <ul className="text-xs text-blue-700 mt-2 space-y-1 list-disc list-inside">
                        <li>Your GCP account will be created and connected</li>
                        <li>Fix inventory worker will be restarted</li>
                        <li>Initial resource discovery will begin</li>
                        <li>You'll be redirected to the discovery dashboard</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(3)}
              >
                Back to Test
              </Button>
              <Button
                onClick={handleCreateAccount}
                disabled={isCreatingAccount}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                {isCreatingAccount ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Connecting Account...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Connect GCP Account
                    <CheckCircle className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
