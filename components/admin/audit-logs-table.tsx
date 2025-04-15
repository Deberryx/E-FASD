"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Download, Calendar } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { format, subDays } from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"

interface AuditLog {
  id: string
  timestamp: string
  user: {
    id: string
    name: string
    email: string
    role: string
  }
  actionType: "create" | "update" | "approve" | "reject" | "delete" | "login" | "logout"
  description: string
  targetType: "request" | "approval" | "recap" | "user" | "department" | "system"
  targetId: string
  ipAddress: string
}

export function AuditLogsTable() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [actionFilter, setActionFilter] = useState<string>("all")
  const [targetFilter, setTargetFilter] = useState<string>("all")
  const [dateRange, setDateRange] = useState<{
    from: Date
    to: Date
  }>({
    from: subDays(new Date(), 7),
    to: new Date(),
  })

  useEffect(() => {
    async function fetchLogs() {
      try {
        setLoading(true)
        const response = await fetch("/api/logs/audit")
        if (response.ok) {
          const data = await response.json()
          setLogs(data)
          setFilteredLogs(data)
        } else {
          console.error("Error fetching audit logs:", await response.text())
        }
      } catch (error) {
        console.error("Error fetching audit logs:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLogs()
  }, [])

  useEffect(() => {
    let result = [...logs]

    // Apply search filter
    if (searchTerm) {
      result = result.filter(
        (log) =>
          log.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.targetId.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply action type filter
    if (actionFilter !== "all") {
      result = result.filter((log) => log.actionType === actionFilter)
    }

    // Apply target type filter
    if (targetFilter !== "all") {
      result = result.filter((log) => log.targetType === targetFilter)
    }

    // Apply date range filter
    result = result.filter((log) => {
      const logDate = new Date(log.timestamp)
      return logDate >= dateRange.from && logDate <= dateRange.to
    })

    setFilteredLogs(result)
  }, [searchTerm, actionFilter, targetFilter, dateRange, logs])

  const handleExportLogs = () => {
    // In a real implementation, this would generate a CSV or PDF
    alert("Exporting audit logs...")
  }

  const getActionBadge = (actionType: string) => {
    switch (actionType) {
      case "create":
        return <Badge className="bg-green-500">Create</Badge>
      case "update":
        return <Badge className="bg-blue-500">Update</Badge>
      case "approve":
        return <Badge className="bg-green-500">Approve</Badge>
      case "reject":
        return <Badge variant="destructive">Reject</Badge>
      case "delete":
        return <Badge variant="destructive">Delete</Badge>
      case "login":
        return <Badge variant="outline">Login</Badge>
      case "logout":
        return <Badge variant="outline">Logout</Badge>
      default:
        return <Badge variant="secondary">{actionType}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between">
          <Skeleton className="h-10 w-[250px]" />
          <Skeleton className="h-10 w-[100px]" />
        </div>
        <div className="border rounded-md">
          <div className="h-10 border-b px-4 py-2">
            <Skeleton className="h-5 w-full" />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 border-b px-4 py-2">
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center gap-2 w-full max-w-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="h-9 w-[130px]">
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="create">Create</SelectItem>
              <SelectItem value="update">Update</SelectItem>
              <SelectItem value="approve">Approve</SelectItem>
              <SelectItem value="reject">Reject</SelectItem>
              <SelectItem value="delete">Delete</SelectItem>
              <SelectItem value="login">Login</SelectItem>
              <SelectItem value="logout">Logout</SelectItem>
            </SelectContent>
          </Select>

          <Select value={targetFilter} onValueChange={setTargetFilter}>
            <SelectTrigger className="h-9 w-[130px]">
              <SelectValue placeholder="Target" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Targets</SelectItem>
              <SelectItem value="request">Request</SelectItem>
              <SelectItem value="approval">Approval</SelectItem>
              <SelectItem value="recap">Recap</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="department">Department</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <Calendar className="h-4 w-4 mr-2" />
                Date Range
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <CalendarComponent
                initialFocus
                mode="range"
                defaultMonth={dateRange.from}
                selected={{
                  from: dateRange.from,
                  to: dateRange.to,
                }}
                onSelect={(range) => {
                  if (range?.from && range?.to) {
                    setDateRange({ from: range.from, to: range.to })
                  }
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>

          <Button variant="outline" size="sm" className="h-9" onClick={handleExportLogs}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>IP Address</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                  No audit logs found
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{format(new Date(log.timestamp), "MMM d, yyyy HH:mm")}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{log.user.name}</span>
                      <span className="text-xs text-muted-foreground">{log.user.role}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getActionBadge(log.actionType)}</TableCell>
                  <TableCell>{log.description}</TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground">{log.targetType}:</span> {log.targetId}
                  </TableCell>
                  <TableCell>{log.ipAddress}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
