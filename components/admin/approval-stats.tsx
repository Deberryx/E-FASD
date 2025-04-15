"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react"

export function ApprovalStats() {
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    recapNeeded: 0,
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/admin/approval-stats")
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error("Error fetching approval stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()

    // For demo purposes, we'll use mock data
    setStats({
      pending: 12,
      approved: 45,
      rejected: 8,
      recapNeeded: 5,
    })
    setLoading(false)
  }, [])

  const statItems = [
    {
      title: "Pending Approvals",
      value: stats.pending,
      icon: Clock,
      description: "Awaiting review",
    },
    {
      title: "Approved",
      value: stats.approved,
      icon: CheckCircle,
      description: "Successfully approved",
    },
    {
      title: "Rejected",
      value: stats.rejected,
      icon: XCircle,
      description: "Declined requests",
    },
    {
      title: "Recap Needed",
      value: stats.recapNeeded,
      icon: AlertCircle,
      description: "Awaiting recap submission",
      alert: stats.recapNeeded > 0,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statItems.map((item) => (
        <Card key={item.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
            <item.icon className={`h-4 w-4 ${item.alert ? "text-amber-500" : "text-muted-foreground"}`} />
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
