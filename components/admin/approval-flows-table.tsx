"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Eye, Download } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { ApprovalDetailsDialog } from "@/components/admin/approval-details-dialog"

interface ApprovalFlow {
  id: string
  requestId: string
  requestType: string
  requester: string
  department: string
  amount: number
  status: "pending" | "approved" | "rejected" | "recap_needed"
  currentApprover: string
  submittedDate: string
  lastUpdated: string
}

export function ApprovalFlowsTable() {
  const [approvals, setApprovals] = useState<ApprovalFlow[]>([])
  const [filteredApprovals, setFilteredApprovals] = useState<ApprovalFlow[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [departmentFilter, setDepartmentFilter] = useState<string>("all")
  const [selectedApproval, setSelectedApproval] = useState<ApprovalFlow | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)

  useEffect(() => {
    async function fetchApprovals() {
      try {
        const response = await fetch("/api/admin/approval-flows")
        if (response.ok) {
          const data = await response.json()
          setApprovals(data)
          setFilteredApprovals(data)
        }
      } catch (error) {
        console.error("Error fetching approvals:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchApprovals()

    // For demo purposes, we'll use mock data
    const mockData: ApprovalFlow[] = [
      {
        id: "1",
        requestId: "REQ-001",
        requestType: "Petty Cash",
        requester: "John Doe",
        department: "Finance",
        amount: 450.0,
        status: "approved",
        currentApprover: "Sarah Williams",
        submittedDate: "2023-04-01T10:30:00Z",
        lastUpdated: "2023-04-02T14:15:00Z",
      },
      {
        id: "2",
        requestId: "REQ-002",
        requestType: "Requisition",
        requester: "Jane Smith",
        department: "Programs",
        amount: 1200.0,
        status: "pending",
        currentApprover: "Michael Johnson",
        submittedDate: "2023-04-03T09:45:00Z",
        lastUpdated: "2023-04-03T09:45:00Z",
      },
      {
        id: "3",
        requestId: "REQ-003",
        requestType: "Petty Cash",
        requester: "Robert Brown",
        department: "Monitoring and Evaluation",
        amount: 320.0,
        status: "rejected",
        currentApprover: "Emily Davis",
        submittedDate: "2023-04-05T11:20:00Z",
        lastUpdated: "2023-04-06T10:10:00Z",
      },
      {
        id: "4",
        requestId: "REQ-004",
        requestType: "Requisition",
        requester: "Michael Johnson",
        department: "Executive",
        amount: 2500.0,
        status: "approved",
        currentApprover: "David Wilson",
        submittedDate: "2023-04-07T14:30:00Z",
        lastUpdated: "2023-04-08T09:20:00Z",
      },
      {
        id: "5",
        requestId: "REQ-005",
        requestType: "Petty Cash",
        requester: "Sarah Williams",
        department: "Finance",
        amount: 180.0,
        status: "recap_needed",
        currentApprover: "James Taylor",
        submittedDate: "2023-04-10T10:15:00Z",
        lastUpdated: "2023-04-11T16:45:00Z",
      },
    ]

    setApprovals(mockData)
    setFilteredApprovals(mockData)
    setLoading(false)
  }, [])

  useEffect(() => {
    let result = [...approvals]

    // Apply search filter
    if (searchTerm) {
      result = result.filter(
        (approval) =>
          approval.requestId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          approval.requester.toLowerCase().includes(searchTerm.toLowerCase()) ||
          approval.department.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((approval) => approval.status === statusFilter)
    }

    // Apply department filter
    if (departmentFilter !== "all") {
      result = result.filter((approval) => approval.department.toLowerCase() === departmentFilter.toLowerCase())
    }

    setFilteredApprovals(result)
  }, [searchTerm, statusFilter, departmentFilter, approvals])

  const handleViewDetails = (approval: ApprovalFlow) => {
    setSelectedApproval(approval)
    setShowDetailsDialog(true)
  }

  const handleExportData = () => {
    // In a real implementation, this would generate a CSV or PDF
    alert("Exporting approval data...")
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500">Approved</Badge>
      case "pending":
        return <Badge variant="outline">Pending</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      case "recap_needed":
        return <Badge className="bg-amber-500">Recap Needed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
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
            placeholder="Search by ID, requester..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="recap_needed">Recap Needed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="h-9 w-[150px]">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="Finance">Finance</SelectItem>
              <SelectItem value="Programs">Programs</SelectItem>
              <SelectItem value="Executive">Executive</SelectItem>
              <SelectItem value="Monitoring and Evaluation">Monitoring & Eval</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" className="h-9" onClick={handleExportData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Request ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Requester</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Amount (GHS)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredApprovals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                  No approval flows found
                </TableCell>
              </TableRow>
            ) : (
              filteredApprovals.map((approval) => (
                <TableRow key={approval.id}>
                  <TableCell className="font-medium">{approval.requestId}</TableCell>
                  <TableCell>{approval.requestType}</TableCell>
                  <TableCell>{approval.requester}</TableCell>
                  <TableCell>{approval.department}</TableCell>
                  <TableCell>{approval.amount.toFixed(2)}</TableCell>
                  <TableCell>{getStatusBadge(approval.status)}</TableCell>
                  <TableCell>{format(new Date(approval.submittedDate), "MMM d, yyyy")}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleViewDetails(approval)}>
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

      {selectedApproval && (
        <ApprovalDetailsDialog
          approval={selectedApproval}
          open={showDetailsDialog}
          onOpenChange={setShowDetailsDialog}
        />
      )}
    </div>
  )
}
