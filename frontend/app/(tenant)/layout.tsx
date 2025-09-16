import type React from "react"
import { TenantLayout } from "./TenantLayout"

export default function Layout({ children }: { children: React.ReactNode }) {
  return <TenantLayout>{children}</TenantLayout>
}
