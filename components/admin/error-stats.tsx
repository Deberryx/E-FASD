"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, AlertTriangle, Bug, Server } from "lucide-react"

export function ErrorStats() {
  const [stats, setStats] = useState({
    critical: 0,
    warning: 0,
    apiErrors: 0,
    databaseErrors: 0,
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/admin/error-stats")
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error("Error fetching error stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()

    // For demo purposes, we'll use mock data
    setStats({
      critical: 2,
      warning: 5,
      apiErrors: 4,
      databaseErrors: 3,
    })
    setLoading(false)
  }, [])

  const statItems = [
    {
      title: "Critical Errors",
      value: stats.critical,
      icon: AlertCircle,
      description: "Last 24 hours",
      alert: stats.critical > 0,
    },
    {
      title: "Warnings",
      value: stats.warning,
      icon: AlertTriangle,
      description: "Last 24 hours",
      alert: stats.warning > 0,
    },
    {
      title: "API Errors",
      value: stats.apiErrors,
      icon: Bug,
      description: "Last 24 hours",
      alert: stats.apiErrors > 0,
    },
    {
      title: "Database Errors",
      value: stats.databaseErrors,
      icon: Server,
      description: "Last 24 hours",
      alert: stats.databaseErrors > 0,
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
