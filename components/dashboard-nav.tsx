"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/client-utils" // Updated import
import {
  BarChart3,
  FileText,
  Home,
  LayoutDashboard,
  Receipt,
  Settings,
  Users,
  ShieldAlert,
  CreditCard,
} from "lucide-react"

interface DashboardNavProps {
  userRole: string
}

export function DashboardNav({ userRole }: DashboardNavProps) {
  const pathname = usePathname()
  const isAdmin = userRole === "Admin"

  // Define role groups for permissions
  const financeRoles = [
    "Finance User Group",
    "Head of Finance",
    "Disburser",
    "Accounts Officer",
    "GRC Manager",
    "Admin",
  ]

  const approvalRoles = [
    "Supervisor",
    "Head of Department",
    "Head of Admin & HR",
    "Head of Finance",
    "Finance User Group",
    "GRC Manager",
    "Admin",
  ]

  const disbursementRoles = ["Disburser", "Finance User Group", "Head of Finance", "Admin"]

  // Define regular navigation items
  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "My Requests",
      href: "/dashboard/requests",
      icon: FileText,
    },
    {
      title: "Pending Approvals",
      href: "/dashboard/approvals",
      icon: Receipt,
      roles: approvalRoles,
    },
    {
      title: "Recaps",
      href: "/dashboard/recaps",
      icon: Home,
    },
    {
      title: "Disbursements",
      href: "/dashboard/disbursements",
      icon: CreditCard,
      roles: disbursementRoles,
    },
    {
      title: "Reports",
      href: "/dashboard/reports",
      icon: BarChart3,
      roles: financeRoles,
    },
    {
      title: "User Management",
      href: "/dashboard/users",
      icon: Users,
      roles: ["Admin", "Head of Admin & HR"],
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ]

  return (
    <nav className="grid items-start px-4 py-4 text-sm font-medium">
      {/* Admin Dashboard link for admin users */}
      {isAdmin && (
        <Link
          href="/admin"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 mb-4 transition-all bg-amber-100 dark:bg-amber-900 text-amber-900 dark:text-amber-100 hover:bg-amber-200 dark:hover:bg-amber-800",
            pathname.startsWith("/admin") && "bg-amber-200 dark:bg-amber-800",
          )}
        >
          <ShieldAlert className="h-4 w-4" />
          Admin Dashboard
        </Link>
      )}

      {/* Divider if admin */}
      {isAdmin && <div className="h-px bg-border mb-4"></div>}

      {/* Regular navigation items */}
      {navItems.map((item) => {
        // Skip items that require specific roles the user doesn't have
        if (item.roles && !item.roles.includes(userRole)) {
          return null
        }

        return (
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
        )
      })}
    </nav>
  )
}
