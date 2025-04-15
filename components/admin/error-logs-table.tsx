"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Download, Calendar, Eye } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { format, subDays } from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { ErrorDetailsDialog } from "@/components/admin/error-details-dialog"

interface ErrorLog {
  id: string
  timestamp: string
  errorType: string
  message: string
  stackTrace?: string
  userId?: string
  userName?: string
  requestInfo?: {
    method: string
    url: string
    body?: any
  }
  severity: "critical" | "warning" | "info"
}

export function ErrorLogsTable() {
  const [logs, setLogs] = useState<ErrorLog[]>([])
  const [filteredLogs, setFilteredLogs] = useState<ErrorLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [severityFilter, setSeverityFilter] = useState<string>("all")
  const [dateRange, setDateRange] = useState<{
    from: Date
    to: Date
  }>({
    from: subDays(new Date(), 7),
    to: new Date(),
  })
  const [selectedError, setSelectedError] = useState<ErrorLog | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)

  useEffect(() => {
    async function fetchLogs() {
      try {
        setLoading(true)
        const response = await fetch("/api/logs/error")
        if (response.ok) {
          const data = await response.json()
          setLogs(data)
          setFilteredLogs(data)
        } else {
          console.error("Error fetching error logs:", await response.text())
        }
      } catch (error) {
        console.error("Error fetching error logs:", error)
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
          log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.errorType.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (log.userName && log.userName.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Apply error type filter
    if (typeFilter !== "all") {
      result = result.filter((log) => log.errorType.toLowerCase().includes(typeFilter.toLowerCase()))
    }

    // Apply severity filter
    if (severityFilter !== "all") {
      result = result.filter((log) => log.severity === severityFilter)
    }

    // Apply date range filter
    result = result.filter((log) => {
      const logDate = new Date(log.timestamp)
      return logDate >= dateRange.from && logDate <= dateRange.to
    })

    setFilteredLogs(result)
  }, [searchTerm, typeFilter, severityFilter, dateRange, logs])

  const handleExportLogs = () => {
    // In a real implementation, this would generate a CSV or PDF
    alert("Exporting error logs...")
  }

  const handleViewDetails = (error: ErrorLog) => {
    setSelectedError(error)
    setShowDetailsDialog(true)
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return <Badge variant="destructive">Critical</Badge>
      case "warning":
        return <Badge className="bg-amber-500">Warning</Badge>
      case "info":
        return <Badge variant="outline">Info</Badge>
      default:
        return <Badge variant="secondary">{severity}</Badge>
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
            placeholder="Search error logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-9 w-[130px]">
              <SelectValue placeholder="Error Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="api">API Errors</SelectItem>
              <SelectItem value="database">Database Errors</SelectItem>
              <SelectItem value="authentication">Auth Errors</SelectItem>
              <SelectItem value="validation">Validation Errors</SelectItem>
              <SelectItem value="azure">Azure Errors</SelectItem>
            </SelectContent>
          </Select>

          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="h-9 w-[130px]">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="info">Info</SelectItem>
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
              <TableHead>Error Type</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Endpoint</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                  No error logs found
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{format(new Date(log.timestamp), "MMM d, yyyy HH:mm")}</TableCell>
                  <TableCell>{log.errorType}</TableCell>
                  <TableCell className="max-w-xs truncate">{log.message}</TableCell>
                  <TableCell>{log.userName || "System"}</TableCell>
                  <TableCell>{log.requestInfo?.url || "N/A"}</TableCell>
                  <TableCell>{getSeverityBadge(log.severity)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleViewDetails(log)}>
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View details</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {selectedError && (
        <ErrorDetailsDialog error={selectedError} open={showDetailsDialog} onOpenChange={setShowDetailsDialog} />
      )}
    </div>
  )
}
