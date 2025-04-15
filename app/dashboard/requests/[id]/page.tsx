"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Download, FileText } from "lucide-react"
import { ApprovalTimeline } from "@/components/approval-timeline"
import { RecapForm } from "@/components/recap-form"
import { BackButton } from "@/components/back-button"

export default function RequestDetailsPage({ params }: { params: { id: string } }) {
  const [showRecapForm, setShowRecapForm] = useState(false)

  // Mock data - in a real app, this would come from API
  const request = {
    id: params.id,
    type: "Petty Cash",
    date: "2023-04-10",
    amount: "180.00",
    status: "recap_needed",
    department: "Finance",
    purpose: "Office supplies purchase",
    details: "Purchase of stationery and other office supplies for the finance department.",
    attachments: [{ name: "receipt.pdf", url: "#" }],
    approvals: [
      {
        role: "Supervisor",
        name: "Jane Smith",
        status: "approved",
        date: "2023-04-11",
        comments: "Approved as requested.",
      },
      {
        role: "Head of Department",
        name: "Michael Johnson",
        status: "approved",
        date: "2023-04-12",
        comments: "Approved. Please ensure receipts are submitted.",
      },
      {
        role: "Finance",
        name: "Sarah Williams",
        status: "recap_needed",
        date: "2023-04-13",
        comments: "Approved. Recap required within 5 days.",
      },
    ],
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

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <BackButton href="/dashboard/requests" label="Back to Requests" />
      </div>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Request {request.id}</h1>
        <div>{getStatusBadge(request.status)}</div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Request Details</CardTitle>
            <CardDescription>
              {request.type} request submitted on {request.date}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Type</h3>
                <p>{request.type}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Amount</h3>
                <p>GHS {request.amount}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Department</h3>
                <p>{request.department}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Date</h3>
                <p>{request.date}</p>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Purpose</h3>
              <p>{request.purpose}</p>
            </div>

            {request.details && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Additional Details</h3>
                <p>{request.details}</p>
              </div>
            )}

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Attachments</h3>
              {request.attachments.length > 0 ? (
                <div className="space-y-2">
                  {request.attachments.map((attachment, index) => (
                    <div key={index} className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">{attachment.name}</span>
                      <Button variant="ghost" size="sm" className="ml-auto h-8 w-8 p-0">
                        <Download className="h-4 w-4" />
                        <span className="sr-only">Download</span>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No attachments</p>
              )}
            </div>
          </CardContent>
          {request.status === "recap_needed" && (
            <CardFooter>
              <Button className="w-full" onClick={() => setShowRecapForm(true)} disabled={showRecapForm}>
                Submit Recap
              </Button>
            </CardFooter>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Approval Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <ApprovalTimeline approvals={request.approvals} />
          </CardContent>
        </Card>

        {showRecapForm && (
          <Card>
            <CardHeader>
              <CardTitle>Submit Recap</CardTitle>
              <CardDescription>Please provide details of how the funds were used</CardDescription>
            </CardHeader>
            <CardContent>
              <RecapForm requestId={request.id} onCancel={() => setShowRecapForm(false)} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
