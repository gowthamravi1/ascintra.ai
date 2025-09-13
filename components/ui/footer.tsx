import Link from "next/link"
import { Separator } from "@/components/ui/separator"

interface FooterProps {
  variant?: "admin" | "tenant"
}

export function Footer({ variant = "tenant" }: FooterProps) {
  const adminLinks = [
    { name: "System Status", href: "/admin/status" },
    { name: "User Management", href: "/admin/users" },
    { name: "Tenant Management", href: "/admin/tenants" },
    { name: "Support", href: "/admin/support" },
  ]

  const tenantLinks = [
    { name: "Recovery Posture", href: "/tenant/posture/scorecard" },
    { name: "Compliance", href: "/tenant/compliance" },
    { name: "Support", href: "/tenant/support" },
    { name: "Documentation", href: "/tenant/docs" },
  ]

  const links = variant === "admin" ? adminLinks : tenantLinks

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
          {/* Logo and Company */}
          <div className="flex items-center space-x-3">
            <img src="/images/ascintra-logo.png" alt="Ascintra.ai" className="h-8 w-8" />
            <div>
              <div className="text-lg font-bold text-gray-900">Ascintra.ai</div>
              <div className="text-sm text-gray-500">Cloud Recovery Posture Management</div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap items-center justify-center space-x-6">
            {links.map((link, index) => (
              <div key={link.name} className="flex items-center">
                <Link href={link.href} className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  {link.name}
                </Link>
                {index < links.length - 1 && <Separator orientation="vertical" className="ml-6 h-4" />}
              </div>
            ))}
          </div>

          {/* Legal Links */}
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <Link href="/privacy" className="hover:text-gray-700 transition-colors">
              Privacy Policy
            </Link>
            <Separator orientation="vertical" className="h-4" />
            <Link href="/terms" className="hover:text-gray-700 transition-colors">
              Terms of Service
            </Link>
            <Separator orientation="vertical" className="h-4" />
            <Link href="/security" className="hover:text-gray-700 transition-colors">
              Security
            </Link>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Copyright */}
        <div className="flex flex-col items-center justify-between space-y-2 text-sm text-gray-500 md:flex-row md:space-y-0">
          <div>© 2025 Ascintra.ai. All rights reserved.</div>
          <div className="flex items-center space-x-4">
            <span>Cloud Recovery Posture Management Platform</span>
            <Separator orientation="vertical" className="h-4" />
            <span>Enterprise Grade Security</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
