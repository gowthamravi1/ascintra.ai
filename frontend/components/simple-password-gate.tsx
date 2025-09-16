"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Lock, Unlock } from "lucide-react"

const CORRECT_PASSWORD = "protoType2@25"
const STORAGE_KEY = "recovery-vault-unlocked"

export function SimplePasswordGate({ children }: { children: React.ReactNode }) {
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    setIsUnlocked(stored === "true")
    setIsLoading(false)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === CORRECT_PASSWORD) {
      setIsUnlocked(true)
      localStorage.setItem(STORAGE_KEY, "true")
      setError("")
    } else {
      setError("Incorrect password")
    }
  }

  const handleLock = () => {
    setIsUnlocked(false)
    localStorage.removeItem(STORAGE_KEY)
    setPassword("")
    setError("")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isUnlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
              <Lock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-2xl font-bold">RecoveryVault</CardTitle>
            <CardDescription>Enter the demo password to access the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter demo password"
                  className={error ? "border-red-500" : ""}
                />
                {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
              </div>
              <Button type="submit" className="w-full">
                <Unlock className="mr-2 h-4 w-4" />
                Unlock Platform
              </Button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Demo Password: <code className="bg-muted px-1 py-0.5 rounded text-xs">protoType2@25</code>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="relative">
      {children}
      <Button
        onClick={handleLock}
        variant="outline"
        size="sm"
        className="fixed top-4 right-4 z-50 bg-background/80 backdrop-blur-sm"
      >
        <Lock className="mr-2 h-4 w-4" />
        Lock Site
      </Button>
    </div>
  )
}
