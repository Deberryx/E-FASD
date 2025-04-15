"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Building2, FileText, AlertCircle } from "lucide-react"

export function AdminStats() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDepartments: 0,
    pendingApprovals: 0,
    systemErrors: 0,
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/admin/stats")
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error("Error fetching admin stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statItems = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      description: "Active user accounts",
    },
    {
      title: "Departments",
      value: stats.totalDepartments,
      icon: Building2,
      description: "Configured departments",
    },
    {
      title: "Pending Approvals",
      value: stats.pendingApprovals,
      icon: FileText,
      description: "Awaiting action",
    },
    {
      title: "System Errors",
      value: stats.systemErrors,
      icon: AlertCircle,
      description: "Last 24 hours",
      alert: stats.systemErrors > 0,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statItems.map((item) => (
        <Card key={item.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
            <item.icon className={`h-4 w-4 ${item.alert ? "text-destructive" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <div className="h-8 w-16 animate-pulse rounded bg-muted"></div> : item.value}
            </div>
            <p className="text-xs text-muted-foreground">{item.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
