"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/client-utils" // Changed from @/lib/utils to @/lib/client-utils
import { BarChart3, ClipboardList, FileText, AlertCircle, Shield, Settings, Users, Building2 } from "lucide-react"

const navItems = [
  {
    title: "Overview",
    href: "/admin",
    icon: BarChart3,
  },
  {
    title: "Approval Flows",
    href: "/admin/approval-flows",
    icon: ClipboardList,
  },
  {
    title: "Audit Logs",
    href: "/admin/audit-logs",
    icon: FileText,
  },
  {
    title: "Error Logs",
    href: "/admin/error-logs",
    icon: AlertCircle,
  },
  {
    title: "User Management",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Department Management",
    href: "/admin/departments",
    icon: Building2,
  },
  {
    title: "Security Settings",
    href: "/admin/security",
    icon: Shield,
  },
  {
    title: "System Settings",
    href: "/admin/settings",
    icon: Settings,
  },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="grid items-start px-4 py-4 text-sm font-medium">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
            pathname === item.href
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          <item.icon className="h-4 w-4" />
          {item.title}
        </Link>
      ))}
    </nav>
  )
}
