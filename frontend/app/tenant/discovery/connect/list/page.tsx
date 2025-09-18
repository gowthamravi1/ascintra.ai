"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet"

type Account = {
  id: string
  provider: string
  account_identifier: string
  name?: string
  primary_region?: string
  connection_status: string
}

type AccountDetail = Account & {
  aws_role_arn?: string
  aws_external_id?: string
  gcp_project_number?: string
  gcp_sa_email?: string
  discovery_enabled?: boolean
  discovery_options?: Record<string, any>
  discovery_frequency?: string
  preferred_time_utc?: string
}

export default function ConnectedAccountsList() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [selected, setSelected] = useState<AccountDetail | null>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/accounts", { cache: "no-store" })
        if (!res.ok) return
        const data = await res.json()
        setAccounts(Array.isArray(data) ? data : [])
      } catch {}
    }
    load()
  }, [])

  const viewDetails = async (id: string) => {
    try {
      const res = await fetch(`/api/accounts/${id}`, { cache: "no-store" })
      if (!res.ok) return
      const data = await res.json()
      setSelected(data)
      setOpen(true)
    } catch {}
  }

  const statusBadge = (s: string) => {
    const v = s.toLowerCase()
    const variant = v === "connected" || v === "active" ? "success" : v === "unknown" ? "secondary" : "warning"
    return <Badge variant={variant as any}>{s}</Badge>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Connected Accounts</CardTitle>
          <CardDescription>List of accounts connected for discovery</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Provider</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="uppercase text-xs">{a.provider}</TableCell>
                  <TableCell className="font-mono text-sm">{a.account_identifier}</TableCell>
                  <TableCell>{a.name || '-'}</TableCell>
                  <TableCell>{a.primary_region || '-'}</TableCell>
                  <TableCell>{statusBadge(a.connection_status)}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" className="bg-transparent" onClick={() => viewDetails(a.id)}>
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {accounts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No accounts connected yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Account Details</SheetTitle>
            <SheetDescription>Information from the connect flow</SheetDescription>
          </SheetHeader>
          {selected ? (
            <div className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Provider</span><span className="uppercase">{selected.provider}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Account</span><span className="font-mono">{selected.account_identifier}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span>{selected.name || '-'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Region</span><span>{selected.primary_region || '-'}</span></div>
              {selected.aws_role_arn && (
                <div className="flex justify-between"><span className="text-muted-foreground">Role ARN</span><span className="font-mono text-xs">{selected.aws_role_arn}</span></div>
              )}
              {selected.gcp_sa_email && (
                <div className="flex justify-between"><span className="text-muted-foreground">GCP SA</span><span className="font-mono text-xs">{selected.gcp_sa_email}</span></div>
              )}
              <div className="pt-2">
                <div className="text-muted-foreground mb-1">Discovery Options</div>
                <pre className="bg-muted rounded p-3 text-xs overflow-x-auto">{JSON.stringify(selected.discovery_options || {}, null, 2)}</pre>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <div className="text-muted-foreground text-xs">Discovery Frequency</div>
                  <div>{selected.discovery_frequency || '-'}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">Preferred Time (UTC)</div>
                  <div>{selected.preferred_time_utc || '-'}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-6 text-sm text-muted-foreground">Select an account to view details.</div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
