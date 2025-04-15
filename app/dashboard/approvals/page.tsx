"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle, Eye, XCircle } from "lucide-react"
import Link from "next/link"
import { ApprovalDialog } from "@/components/approval-dialog"
import { BackButton } from "@/components/back-button"

export default function ApprovalsPage() {
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [showApprovalDialog, setShowApprovalDialog] = useState(false)
  const [action, setAction] = useState<"approve" | "reject">("approve")

  // Mock data - in a real app, this would come from API
  const pendingRequests = [
    {
      id: "REQ-006",
      type: "Petty Cash",
      date: "2023-04-15",
      amount: "350.00",
      user: "John Doe",
      department: "Administrative and HR",
      purpose: "Office supplies",
    },
    {
      id: "REQ-007",
      type: "Requisition",
      date: "2023-04-16",
      amount: "1800.00",
      user: "Jane Smith",
      department: "Programs",
      purpose: "Workshop materials",
    },
  ]

  const completedRequests = [
    {
      id: "REQ-004",
      type: "Requisition",
      date: "2023-04-07",
      amount: "2500.00",
      user: "Michael Johnson",
      department: "Executive",
      purpose: "Conference registration",
      status: "approved",
    },
    {
      id: "REQ-003",
      type: "Petty Cash",
      date: "2023-04-05",
      amount: "320.00",
      user: "Sarah Williams",
      department: "Monitoring and Evaluation",
      purpose: "Field visit expenses",
      status: "rejected",
    },
  ]

  const handleApprove = (request: any) => {
    setSelectedRequest(request)
    setAction("approve")
    setShowApprovalDialog(true)
  }

  const handleReject = (request: any) => {
    setSelectedRequest(request)
    setAction("reject")
    setShowApprovalDialog(true)
  }

  const handleApprovalSubmit = (comments: string) => {
    // In a real app, this would submit to an API
    console.log({
      requestId: selectedRequest.id,
      action,
      comments,
    })

    setShowApprovalDialog(false)
    // Here you would update the UI or refetch data
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500">Approved</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="mb-6">
        <BackButton />
      </div>

      <h1 className="text-2xl font-bold tracking-tight">Pending Approvals</h1>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Requests Awaiting Your Approval</CardTitle>
              <CardDescription>Review and approve or reject these requests</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingRequests.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Request ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Requester</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Amount (GHS)</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">{request.id}</TableCell>
                        <TableCell>{request.type}</TableCell>
                        <TableCell>{request.user}</TableCell>
                        <TableCell>{request.department}</TableCell>
                        <TableCell>{request.amount}</TableCell>
                        <TableCell>{request.purpose}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/dashboard/requests/${request.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600"
                              onClick={() => handleApprove(request)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive"
                              onClick={() => handleReject(request)}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-6 text-muted-foreground">No pending requests to approve</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>Previously Reviewed Requests</CardTitle>
              <CardDescription>History of requests you have approved or rejected</CardDescription>
            </CardHeader>
            <CardContent>
              {completedRequests.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Request ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Requester</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Amount (GHS)</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {completedRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">{request.id}</TableCell>
                        <TableCell>{request.type}</TableCell>
                        <TableCell>{request.user}</TableCell>
                        <TableCell>{request.department}</TableCell>
                        <TableCell>{request.amount}</TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
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
              ) : (
                <div className="text-center py-6 text-muted-foreground">No completed approvals to display</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {showApprovalDialog && selectedRequest && (
        <ApprovalDialog
          request={selectedRequest}
          action={action}
          open={showApprovalDialog}
          onOpenChange={setShowApprovalDialog}
          onSubmit={handleApprovalSubmit}
        />
      )}
    </div>
  )
}
