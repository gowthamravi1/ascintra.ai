"use client"
import { useState } from "react"
import {
  CheckCircle,
  Copy,
  Download,
  ExternalLink,
  Shield,
  AlertCircle,
  Clock,
  Key,
  Database,
  Server,
  Cloud,
  ArrowRight,
  RefreshCw,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export default function ConnectAWSAccount() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "connecting" | "success" | "error">("idle")
  const [accountId, setAccountId] = useState("")
  const [accountName, setAccountName] = useState("")
  const [primaryRegion, setPrimaryRegion] = useState("")
  const [roleArn, setRoleArn] = useState("")
  const [awsAccessKeyId, setAwsAccessKeyId] = useState("")
  const [awsSecretAccessKey, setAwsSecretAccessKey] = useState("")
  const [discFreq, setDiscFreq] = useState("Every 6 hours")
  const [prefTime, setPrefTime] = useState("02:00")

  const handleConnect = async () => {
    setIsConnecting(true)
    setConnectionStatus("connecting")
    try {
      const res = await fetch("/api/accounts/test-connection", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          provider: "aws",
          account_identifier: accountId,
          aws_role_arn: roleArn,
          aws_access_key_id: awsAccessKeyId || undefined,
          aws_secret_access_key: awsSecretAccessKey || undefined,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data?.ok) {
        setConnectionStatus("success")
      } else {
        setConnectionStatus("error")
      }
    } catch (e) {
      setConnectionStatus("error")
    } finally {
      setIsConnecting(false)
    }
  }

  const steps = [
    { id: 1, title: "Account Setup", description: "Configure AWS account details" },
    { id: 2, title: "IAM Role Creation", description: "Create required IAM role" },
    { id: 3, title: "Connection Test", description: "Verify connectivity" },
    { id: 4, title: "Discovery Setup", description: "Configure resource discovery" },
  ]

  const cloudFormationTemplate = `{
  "AWSTemplateFormatVersion": "2010-09-09",
  "Description": "RecoveryVault IAM Role for AWS Account Discovery",
  "Resources": {
    "RecoveryVaultRole": {
      "Type": "AWS::IAM::Role",
      "Properties": {
        "RoleName": "RecoveryVault-DiscoveryRole",
        "AssumeRolePolicyDocument": {
          "Version": "2012-10-17",
          "Statement": [
            {
              "Effect": "Allow",
              "Principal": {
                "AWS": "arn:aws:iam::123456789012:root"
              },
              "Action": "sts:AssumeRole",
              "Condition": {
                "StringEquals": {
                  "sts:ExternalId": "recovery-vault-external-id"
                }
              }
            }
          ]
        },
        "ManagedPolicyArns": [
          "arn:aws:iam::aws:policy/ReadOnlyAccess",
          "arn:aws:iam::aws:policy/AWSBackupServiceRolePolicyForBackup"
        ]
      }
    }
  },
  "Outputs": {
    "RoleArn": {
      "Description": "ARN of the created IAM role",
      "Value": {
        "Fn::GetAtt": ["RecoveryVaultRole", "Arn"]
      }
    }
  }
}`

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Connect AWS Account
          </h1>
          <p className="text-gray-600 mt-2">
            Securely connect your AWS account to enable resource discovery and backup monitoring
          </p>
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          <Shield className="h-3 w-3 mr-1" />
          Secure Connection
        </Badge>
      </div>

      {/* Progress Steps */}
      <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
        <CardHeader>
          <CardTitle>Connection Progress</CardTitle>
          <CardDescription>Follow these steps to connect your AWS account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep > step.id
                        ? "bg-green-500 text-white"
                        : currentStep === step.id
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {currentStep > step.id ? <CheckCircle className="h-5 w-5" /> : step.id}
                  </div>
                  <div className="mt-2 text-center">
                    <div className="text-sm font-medium text-gray-900">{step.title}</div>
                    <div className="text-xs text-gray-500">{step.description}</div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${currentStep > step.id ? "bg-green-500" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      {currentStep === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-blue-600" />
                Account Information
              </CardTitle>
              <CardDescription>Enter your AWS account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">AWS Account ID</label>
                <Input
                  placeholder="123456789012"
                  className="bg-white/50"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Account Name (Optional)</label>
                <Input
                  placeholder="Production Account"
                  className="bg-white/50"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Primary Region</label>
                <Input
                  placeholder="us-east-1"
                  className="bg-white/50"
                  value={primaryRegion}
                  onChange={(e) => setPrimaryRegion(e.target.value)}
                />
              </div>
              <Button
                onClick={() => setCurrentStep(2)}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                Continue to IAM Setup
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                Security & Permissions
              </CardTitle>
              <CardDescription>What RecoveryVault will access</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    icon: Database,
                    title: "Resource Discovery",
                    description: "Read-only access to EC2, RDS, S3, and other AWS services",
                  },
                  {
                    icon: Server,
                    title: "Backup Information",
                    description: "Access to AWS Backup service data and policies",
                  },
                  {
                    icon: Cloud,
                    title: "Configuration Data",
                    description: "Read configuration settings for disaster recovery analysis",
                  },
                ].map((item, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50/50">
                    <item.icon className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-900">{item.title}</div>
                      <div className="text-sm text-gray-600">{item.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {currentStep === 2 && (
        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-orange-600" />
              IAM Role Creation
            </CardTitle>
            <CardDescription>
              Create an IAM role in your AWS account to allow RecoveryVault secure access
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <div className="font-medium text-blue-900">CloudFormation Template</div>
                  <div className="text-sm text-blue-700 mt-1">
                    Use this pre-configured template to create the required IAM role with minimal permissions
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">CloudFormation Template</h3>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(cloudFormationTemplate)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>

              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm text-gray-100">
                  <code>{cloudFormationTemplate}</code>
                </pre>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Manual Steps:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                    <li>Open AWS CloudFormation console</li>
                    <li>Create new stack with above template</li>
                    <li>Deploy the stack</li>
                    <li>Copy the Role ARN from outputs</li>
                  </ol>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Quick Deploy:</h4>
                  <Button variant="outline" className="w-full bg-transparent" asChild>
                    <a
                      href="https://console.aws.amazon.com/cloudformation/home#/stacks/create/template"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open CloudFormation Console
                    </a>
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700 block">IAM Role ARN</label>
                <Input
                  placeholder="arn:aws:iam::123456789012:role/RecoveryVault-DiscoveryRole"
                  className="bg-white/50"
                  value={roleArn}
                  onChange={(e) => setRoleArn(e.target.value)}
                />
                <p className="text-xs text-gray-500">Paste the Role ARN from your CloudFormation stack outputs</p>
              </div>

              <div className="flex space-x-3">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  Back
                </Button>
                <Button
                  onClick={() => setCurrentStep(3)}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  Test Connection
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 3 && (
      <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-purple-600" />
            Connection Test
          </CardTitle>
          <CardDescription>Verify that RecoveryVault can successfully connect to your AWS account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block">AWS Access Key ID</label>
              <Input
                placeholder="AKIA..."
                className="bg-white/50"
                value={awsAccessKeyId}
                onChange={(e) => setAwsAccessKeyId(e.target.value)}
              />
              <p className="text-xs text-gray-500">Optional: used to update Arango configs for discovery</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block">AWS Secret Access Key</label>
              <Input
                type="password"
                placeholder="********"
                className="bg-white/50"
                value={awsSecretAccessKey}
                onChange={(e) => setAwsSecretAccessKey(e.target.value)}
              />
            </div>
          </div>
            {connectionStatus === "idle" && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Cloud className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Ready to Test Connection</h3>
                  <p className="text-gray-600 mt-1">Click the button below to verify your AWS account connection</p>
                </div>
                <Button
                  onClick={handleConnect}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  Test AWS Connection
                </Button>
              </div>
            )}

            {connectionStatus === "connecting" && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Testing Connection...</h3>
                  <p className="text-gray-600 mt-1">Verifying IAM role permissions and connectivity</p>
                </div>
                <div className="max-w-md mx-auto">
                  <Progress value={66} className="h-2" />
                  <p className="text-sm text-gray-500 mt-2">Checking permissions...</p>
                </div>
              </div>
            )}

            {connectionStatus === "success" && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Connection Successful!</h3>
                  <p className="text-gray-600 mt-1">
                    Your AWS account has been successfully connected to RecoveryVault
                  </p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
                  <div className="text-sm text-green-800">
                    <div className="font-medium">Connection Details:</div>
                    <div className="mt-1 space-y-1">
                      <div>Account ID: 123456789012</div>
                      <div>Region: us-east-1</div>
                      <div>Role: RecoveryVault-DiscoveryRole</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {connectionStatus === "success" && (
              <div className="flex justify-center">
                <Button
                  onClick={() => setCurrentStep(4)}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  Continue to Discovery Setup
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {currentStep === 4 && (
        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-green-600" />
              Discovery Configuration
            </CardTitle>
            <CardDescription>Configure resource discovery settings for your AWS account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Discovery Settings</h3>

                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input type="checkbox" defaultChecked className="rounded border-gray-300" />
                    <span className="text-sm text-gray-700">Enable automatic discovery</span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input type="checkbox" defaultChecked className="rounded border-gray-300" />
                    <span className="text-sm text-gray-700">Discover EC2 instances</span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input type="checkbox" defaultChecked className="rounded border-gray-300" />
                    <span className="text-sm text-gray-700">Discover RDS databases</span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input type="checkbox" defaultChecked className="rounded border-gray-300" />
                    <span className="text-sm text-gray-700">Discover S3 buckets</span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input type="checkbox" defaultChecked className="rounded border-gray-300" />
                    <span className="text-sm text-gray-700">Discover EBS volumes</span>
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Schedule</h3>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">Discovery Frequency</label>
                    <select
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                      value={discFreq}
                      onChange={(e) => setDiscFreq(e.target.value)}
                    >
                      <option>Every 6 hours</option>
                      <option>Every 12 hours</option>
                      <option>Daily</option>
                      <option>Weekly</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">Preferred Time (UTC)</label>
                    <input
                      type="time"
                      value={prefTime}
                      onChange={(e) => setPrefTime(e.target.value)}
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <div className="font-medium text-blue-900">Initial Discovery</div>
                  <div className="text-sm text-blue-700 mt-1">
                    The first discovery scan will begin immediately after setup completion and may take 10-30 minutes
                    depending on your account size.
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button variant="outline" onClick={() => setCurrentStep(3)}>
                Back
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                onClick={async () => {
                  try {
                    const res = await fetch("/api/accounts", {
                      method: "POST",
                      headers: { "content-type": "application/json" },
                      body: JSON.stringify({
                        provider: "aws",
                        account_identifier: accountId,
                        name: accountName,
                        primary_region: primaryRegion,
                        aws_role_arn: roleArn,
                        aws_access_key_id: awsAccessKeyId || undefined,
                        aws_secret_access_key: awsSecretAccessKey || undefined,
                        discovery_frequency: discFreq,
                        preferred_time_utc: prefTime,
                        discovery_enabled: true,
                        discovery_options: { ec2: true, rds: true, s3: true, ebs: true },
                      }),
                    })
                    if (res.ok) {
                      toast.success("Account connected")
                      setTimeout(() => router.push("/tenant/discovery/history"), 600)
                    } else {
                      toast.error("Failed to connect account")
                    }
                  } catch (e) {
                    toast.error("Failed to connect account")
                  }
                }}
              >
                Complete Setup
                <CheckCircle className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
