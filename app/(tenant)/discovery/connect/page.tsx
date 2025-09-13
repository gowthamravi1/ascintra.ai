"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ArrowRight, Check, Copy, ExternalLink, AlertCircle, CheckCircle } from "lucide-react"

const steps = [
  { id: 1, title: "IAM Role Setup", description: "Deploy CloudFormation template" },
  { id: 2, title: "Permissions Test", description: "Verify access permissions" },
  { id: 3, title: "Confirmation", description: "Complete account connection" },
]

const cloudFormationTemplate = `{
  "AWSTemplateFormatVersion": "2010-09-09",
  "Description": "RecoveryVault IAM Role for Security Scanning",
  "Resources": {
    "RecoveryVaultRole": {
      "Type": "AWS::IAM::Role",
      "Properties": {
        "RoleName": "RecoveryVault-SecurityScanner",
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
                  "sts:ExternalId": "recovery-vault-external-id-12345"
                }
              }
            }
          ]
        },
        "ManagedPolicyArns": [
          "arn:aws:iam::aws:policy/SecurityAudit",
          "arn:aws:iam::aws:policy/ReadOnlyAccess"
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

export default function ConnectAccountPage() {
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [copied, setCopied] = useState(false)
  const [permissionsTest, setPermissionsTest] = useState<"idle" | "testing" | "success" | "failed">("idle")

  const copyToClipboard = () => {
    navigator.clipboard.writeText(cloudFormationTemplate)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const testPermissions = () => {
    setPermissionsTest("testing")
    // Simulate API call
    setTimeout(() => {
      setPermissionsTest("success")
    }, 3000)
  }

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Discovery</h1>
          <p className="text-muted-foreground">Connect your AWS accounts for security scanning</p>
        </div>
        <Dialog open={isWizardOpen} onOpenChange={setIsWizardOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <ExternalLink className="h-4 w-4" />
              Connect New Account
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Connect AWS Account</DialogTitle>
              <DialogDescription>
                Follow these steps to securely connect your AWS account to RecoveryVault
              </DialogDescription>
            </DialogHeader>

            {/* Progress Steps */}
            <div className="flex items-center justify-between mb-6">
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

            {/* Step Content */}
            <div className="space-y-6">
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Deploy CloudFormation Template</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Copy the CloudFormation template below and deploy it in your AWS account to create the necessary
                      IAM role.
                    </p>
                  </div>

                  <div className="relative">
                    <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto max-h-96">
                      <code>{cloudFormationTemplate}</code>
                    </pre>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-2 right-2 bg-transparent"
                      onClick={copyToClipboard}
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copied ? "Copied!" : "Copy"}
                    </Button>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-accent/10 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-accent mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium">Important Notes:</p>
                      <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                        <li>Deploy this template in the AWS account you want to scan</li>
                        <li>The role grants read-only access for security auditing</li>
                        <li>External ID ensures secure cross-account access</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Test Permissions</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      We'll test the IAM role to ensure RecoveryVault can access your AWS account securely.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">IAM Role ARN</p>
                        <p className="text-sm text-muted-foreground">
                          arn:aws:iam::123456789012:role/RecoveryVault-SecurityScanner
                        </p>
                      </div>
                      <Badge variant="success">Detected</Badge>
                    </div>

                    <Button onClick={testPermissions} disabled={permissionsTest === "testing"} className="w-full">
                      {permissionsTest === "testing" ? "Testing Permissions..." : "Test Permissions"}
                    </Button>

                    {permissionsTest === "success" && (
                      <div className="flex items-center gap-3 p-4 bg-success/10 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-success" />
                        <div>
                          <p className="font-medium text-success">Permissions Test Successful</p>
                          <p className="text-sm text-muted-foreground">RecoveryVault can access your AWS account</p>
                        </div>
                      </div>
                    )}

                    {permissionsTest === "failed" && (
                      <div className="flex items-center gap-3 p-4 bg-critical/10 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-critical" />
                        <div>
                          <p className="font-medium text-critical">Permissions Test Failed</p>
                          <p className="text-sm text-muted-foreground">Please check the IAM role configuration</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Account Connected Successfully</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Your AWS account has been successfully connected to RecoveryVault.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <p className="font-medium">Account ID</p>
                        <p className="text-sm text-muted-foreground">123456789012</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <p className="font-medium">Account Name</p>
                        <p className="text-sm text-muted-foreground">Production</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-success/10 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-success" />
                      <div>
                        <p className="font-medium text-success">Ready for Scanning</p>
                        <p className="text-sm text-muted-foreground">
                          Your first security scan will begin automatically
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex justify-between pt-6 border-t">
              <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1}>
                Previous
              </Button>
              <Button
                onClick={currentStep === steps.length ? () => setIsWizardOpen(false) : handleNext}
                disabled={currentStep === 2 && permissionsTest !== "success"}
              >
                {currentStep === steps.length ? "Complete" : "Next"}
                {currentStep < steps.length && <ArrowRight className="h-4 w-4 ml-2" />}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Connected Accounts */}
      <Card>
        <CardHeader>
          <CardTitle>Connected AWS Accounts</CardTitle>
          <CardDescription>Manage your connected AWS accounts and their scanning status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                accountId: "123456789012",
                accountName: "Production",
                status: "active",
                lastScan: "2 hours ago",
                resources: 1247,
              },
              {
                accountId: "987654321098",
                accountName: "Staging",
                status: "active",
                lastScan: "1 day ago",
                resources: 456,
              },
              {
                accountId: "456789012345",
                accountName: "Development",
                status: "scanning",
                lastScan: "In progress",
                resources: 234,
              },
            ].map((account) => (
              <div key={account.accountId} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-medium">{account.accountName}</p>
                    <p className="text-sm text-muted-foreground">{account.accountId}</p>
                  </div>
                  <Badge
                    variant={
                      account.status === "active" ? "success" : account.status === "scanning" ? "warning" : "secondary"
                    }
                  >
                    {account.status}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{account.resources} resources</p>
                  <p className="text-xs text-muted-foreground">Last scan: {account.lastScan}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
