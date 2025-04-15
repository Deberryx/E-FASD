"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Database } from "lucide-react"

interface SystemStatusData {
  databaseStatus: "online" | "degraded" | "offline"
  azureAdStatus: "online" | "degraded" | "offline"
  azureStorageStatus: "online" | "degraded" | "offline"
  emailServiceStatus: "online" | "degraded" | "offline"
  apiPerformance: {
    responseTime: number
    errorRate: number
    requestsPerMinute: number
  }
  databaseHealth: {
    connectionPoolSize: number
    activeConnections: number
    availableConnections: number
    averageQueryTime: number
    recentErrors: number
  }
  lastUpdated: string
}

export function SystemStatus() {
  const [status, setStatus] = useState<SystemStatusData | null>(null)
  const [loading, setLoading] = useState(true)
  const [repairing, setRepairing] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    async function fetchStatus() {
      try {
        const response = await fetch("/api/admin/system-status")
        if (response.ok) {
          const data = await response.json()
          setStatus(data)
        }
      } catch (error) {
        console.error("Error fetching system status:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStatus()

    // For demo purposes, we'll use mock data
    setStatus({
      databaseStatus: "online",
      azureAdStatus: "online",
      azureStorageStatus: "online",
      emailServiceStatus: "online",
      apiPerformance: {
        responseTime: 120, // ms
        errorRate: 0.2, // %
        requestsPerMinute: 42,
      },
      databaseHealth: {
        connectionPoolSize: 100,
        activeConnections: 30,
        availableConnections: 70,
        averageQueryTime: 5,
        recentErrors: 0,
      },
      lastUpdated: new Date().toISOString(),
    })
    setLoading(false)
  }, [])

  const getStatusBadge = (status: "online" | "degraded" | "offline") => {
    switch (status) {
      case "online":
        return <Badge className="bg-green-500">Online</Badge>
      case "degraded":
        return <Badge className="bg-amber-500">Degraded</Badge>
      case "offline":
        return <Badge variant="destructive">Offline</Badge>
    }
  }

  const handleRepairDatabase = async () => {
    setRepairing(true)
    try {
      const response = await fetch("/api/admin/repair-database", {
        method: "POST",
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Database Repair Completed",
          description: `Fixed ${data.stats.usersWithNullExternalIdFixed} users with null externalId and ${data.stats.duplicateEmailsFixed} duplicate emails.`,
        })
      } else {
        const error = await response.json()
        toast({
          title: "Database Repair Failed",
          description: error.error || "An error occurred during database repair.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error repairing database:", error)
      toast({
        title: "Database Repair Failed",
        description: "An unexpected error occurred during database repair.",
        variant: "destructive",
      })
    } finally {
      setRepairing(false)
    }
  }

  if (loading) {
    return <div className="h-40 w-full animate-pulse rounded bg-muted"></div>
  }

  if (!status) {
    return <p className="text-center py-4 text-muted-foreground">Unable to fetch system status</p>
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">MongoDB Database</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                {getStatusBadge(status.databaseStatus)}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRepairDatabase}
                  disabled={repairing || status.databaseStatus === "offline"}
                >
                  <Database className="h-4 w-4 mr-2" />
                  {repairing ? "Repairing..." : "Repair Database"}
                </Button>
              </div>

              {status.databaseHealth && (
                <div className="mt-2 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Connection Pool:</span>
                    <span>
                      {status.databaseHealth.activeConnections}/{status.databaseHealth.connectionPoolSize}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg Query Time:</span>
                    <span>{status.databaseHealth.averageQueryTime}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Recent Errors:</span>
                    <span className={status.databaseHealth.recentErrors > 0 ? "text-red-500" : ""}>
                      {status.databaseHealth.recentErrors}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Azure AD</CardTitle>
          </CardHeader>
          <CardContent>{getStatusBadge(status.azureAdStatus)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Azure Storage</CardTitle>
          </CardHeader>
          <CardContent>{getStatusBadge(status.azureStorageStatus)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Email Service</CardTitle>
          </CardHeader>
          <CardContent>{getStatusBadge(status.emailServiceStatus)}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>API Performance</CardTitle>
          <CardDescription>Current API performance metrics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Response Time</p>
              <p className="text-sm text-muted-foreground">{status.apiPerformance.responseTime} ms</p>
            </div>
            <Progress value={Math.min(100, (status.apiPerformance.responseTime / 500) * 100)} className="mt-2" />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Error Rate</p>
              <p className="text-sm text-muted-foreground">{status.apiPerformance.errorRate}%</p>
            </div>
            <Progress value={status.apiPerformance.errorRate} className="mt-2" />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Requests Per Minute</p>
              <p className="text-sm text-muted-foreground">{status.apiPerformance.requestsPerMinute}</p>
            </div>
            <Progress value={Math.min(100, (status.apiPerformance.requestsPerMinute / 100) * 100)} className="mt-2" />
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-right text-muted-foreground">
        Last updated: {new Date(status.lastUpdated).toLocaleString()}
      </p>
    </div>
  )
}
