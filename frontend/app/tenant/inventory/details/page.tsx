"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Shield, AlertTriangle, Database, ExternalLink, Copy, CheckCircle } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface AssetDetails {
  asset_id: string
  arango_id: string
  account_info: {
    account_id: string
    account_name: string
    provider: string
    region: string
  }
  inventory_data: {
    service: string
    kind: string
    resource_id: string
    name: string
    provider: string
    status: string
    region: string | null
    last_backup: string | null
    tags: Record<string, any>
    created_at: string
    updated_at: string
  }
  arango_document: Record<string, any>
  metadata: {
    total_size: number
    document_keys: string[]
    kinds: string[]
    reported_fields: string[]
  }
}

export default function AssetDetailsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [assetDetails, setAssetDetails] = useState<AssetDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const assetId = searchParams.get('id')

  useEffect(() => {
    if (!assetId) {
      setError("Asset ID is required")
      setLoading(false)
      return
    }

    const fetchAssetDetails = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/tenant/inventory/asset/${assetId}?account_identifier=142141431503`)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch asset details: ${response.statusText}`)
        }
        
        const result = await response.json()
        
        if (result.success) {
          setAssetDetails(result.data)
        } else {
          throw new Error("Failed to fetch asset details")
        }
      } catch (err) {
        console.error('Error fetching asset details:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchAssetDetails()
  }, [assetId])

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      toast({
        title: "Copied to clipboard",
        description: `${field} copied successfully`,
      })
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      })
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    if (status.includes('protected')) return "success"
    if (status.includes('unprotected')) return "critical"
    return "secondary"
  }

  const getStatusIcon = (status: string) => {
    if (status.includes('protected')) return <Shield className="h-4 w-4 text-green-600" />
    if (status.includes('unprotected')) return <AlertTriangle className="h-4 w-4 text-red-600" />
    return <AlertTriangle className="h-4 w-4 text-yellow-600" />
  }

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return "N/A"
    if (typeof value === 'object') return JSON.stringify(value, null, 2)
    if (typeof value === 'boolean') return value ? 'Yes' : 'No'
    if (typeof value === 'string' && value.includes('T') && value.includes('Z')) {
      return new Date(value).toLocaleString()
    }
    return String(value)
  }

  const renderObject = (obj: any, depth = 0): JSX.Element => {
    if (obj === null || obj === undefined) return <span className="text-muted-foreground">N/A</span>
    
    if (typeof obj !== 'object') {
      return <span>{formatValue(obj)}</span>
    }

    if (Array.isArray(obj)) {
      return (
        <div className="space-y-1">
          {obj.map((item, index) => (
            <div key={index} className="ml-4">
              <span className="text-muted-foreground">[{index}]</span> {renderObject(item, depth + 1)}
            </div>
          ))}
        </div>
      )
    }

    return (
      <div className="space-y-1">
        {Object.entries(obj).map(([key, value]) => (
          <div key={key} className="ml-4">
            <span className="font-medium text-blue-600">{key}:</span> {renderObject(value, depth + 1)}
          </div>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="space-y-4">
          <div className="h-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-64 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    )
  }

  if (error || !assetDetails) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Asset Details</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error Loading Asset</h3>
              <p className="text-muted-foreground">{error || "Asset not found"}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">{assetDetails.inventory_data.name}</h1>
          <p className="text-muted-foreground">{assetDetails.inventory_data.kind} • {assetDetails.inventory_data.resource_id}</p>
        </div>
      </div>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon(assetDetails.inventory_data.status)}
            Asset Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Protection Status</p>
              <Badge variant={getStatusBadgeVariant(assetDetails.inventory_data.status)} className="mt-1">
                {assetDetails.inventory_data.status}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Service</p>
              <p className="font-medium">{assetDetails.inventory_data.service}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Provider</p>
              <p className="font-medium">{assetDetails.inventory_data.provider}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Data</TabsTrigger>
          <TabsTrigger value="arango">Raw Document</TabsTrigger>
          <TabsTrigger value="metadata">Metadata</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Asset ID</p>
                  <div className="flex items-center gap-2">
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">{assetDetails.asset_id}</code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(assetDetails.asset_id, 'Asset ID')}
                    >
                      {copiedField === 'Asset ID' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Arango ID</p>
                  <div className="flex items-center gap-2">
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">{assetDetails.arango_id}</code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(assetDetails.arango_id, 'Arango ID')}
                    >
                      {copiedField === 'Arango ID' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Resource ID</p>
                  <p className="font-medium">{assetDetails.inventory_data.resource_id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Region</p>
                  <p className="font-medium">{assetDetails.inventory_data.region || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Backup</p>
                  <p className="font-medium">{assetDetails.inventory_data.last_backup || 'Never'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-medium">{new Date(assetDetails.inventory_data.created_at).toLocaleString()}</p>
                </div>
              </div>

              {Object.keys(assetDetails.inventory_data.tags).length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(assetDetails.inventory_data.tags).map(([key, value]) => (
                        <Badge key={key} variant="outline">
                          {key}: {String(value)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Account ID</p>
                  <p className="font-medium">{assetDetails.account_info.account_id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Account Name</p>
                  <p className="font-medium">{assetDetails.account_info.account_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Provider</p>
                  <p className="font-medium">{assetDetails.account_info.provider}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Primary Region</p>
                  <p className="font-medium">{assetDetails.account_info.region}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Data</CardTitle>
              <CardDescription>Data stored in PostgreSQL assets_inventory table</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(assetDetails.inventory_data).map(([key, value]) => (
                  <div key={key}>
                    <p className="text-sm font-medium text-muted-foreground">{key}</p>
                    <div className="mt-1 p-3 bg-gray-50 rounded-md">
                      <pre className="text-sm whitespace-pre-wrap">{formatValue(value)}</pre>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="arango" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Raw ArangoDB Document</CardTitle>
              <CardDescription>Complete document from ArangoDB fix collection</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(assetDetails.arango_document).map(([key, value]) => (
                  <div key={key}>
                    <p className="text-sm font-medium text-muted-foreground">{key}</p>
                    <div className="mt-1 p-3 bg-gray-50 rounded-md max-h-64 overflow-y-auto">
                      {renderObject(value)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metadata" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Document Metadata</CardTitle>
              <CardDescription>Information about the ArangoDB document structure</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Document Size</p>
                  <p className="font-medium">{assetDetails.metadata.total_size} characters</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Document Keys</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {assetDetails.metadata.document_keys.map((key) => (
                      <Badge key={key} variant="outline">{key}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Resource Kinds</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {assetDetails.metadata.kinds.map((kind) => (
                      <Badge key={kind} variant="secondary">{kind}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Reported Fields</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {assetDetails.metadata.reported_fields.map((field) => (
                      <Badge key={field} variant="outline">{field}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}