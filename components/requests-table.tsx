"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import Link from "next/link"

export function RequestsTable() {
  // Mock data - in a real app, this would come from API
  const [requests] = useState([
    {
      id: "REQ-001",
      type: "Petty Cash",
      date: "2023-04-01",
      amount: "450.00",
      status: "approved",
      department: "Administrative and HR",
    },
    {
      id: "REQ-002",
      type: "Requisition",
      date: "2023-04-03",
      amount: "1200.00",
      status: "pending",
      department: "Programs",
    },
    {
      id: "REQ-003",
      type: "Petty Cash",
      date: "2023-04-05",
      amount: "320.00",
      status: "rejected",
      department: "Monitoring and Evaluation",
    },
    {
      id: "REQ-004",
      type: "Requisition",
      date: "2023-04-07",
      amount: "2500.00",
      status: "approved",
      department: "Executive",
    },
    {
      id: "REQ-005",
      type: "Petty Cash",
      date: "2023-04-10",
      amount: "180.00",
      status: "recap_needed",
      department: "Finance",
    },
  ])

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

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Request ID</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Amount (GHS)</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Department</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {requests.map((request) => (
          <TableRow key={request.id}>
            <TableCell className="font-medium">{request.id}</TableCell>
            <TableCell>{request.type}</TableCell>
            <TableCell>{request.date}</TableCell>
            <TableCell>{request.amount}</TableCell>
            <TableCell>{getStatusBadge(request.status)}</TableCell>
            <TableCell>{request.department}</TableCell>
            <TableCell className="text-right">
              <Link href={`/dashboard/requests/${request.id}`}>
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
