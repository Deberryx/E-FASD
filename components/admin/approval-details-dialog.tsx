"use client"

import { useState } from "react"
import { format } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { FileText, Download, Clock, CheckCircle, XCircle } from "lucide-react"

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

interface ApprovalDetailsDialogProps {
  approval: ApprovalFlow
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ApprovalDetailsDialog({ approval, open, onOpenChange }: ApprovalDetailsDialogProps) {
  const [loading, setLoading] = useState(false)

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "pending":
        return <Clock className="h-5 w-5 text-muted-foreground" />
      case "rejected":
        return <XCircle className="h-5 w-5 text-destructive" />
      case "recap_needed":
        return <CheckCircle className="h-5 w-5 text-amber-500" />
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />
    }
  }

  // Mock approval timeline data
  const approvalTimeline = [
    {
      role: "Supervisor",
      name: "Jane Smith",
      status: "approved",
      date: "2023-04-11T10:30:00Z",
      comments: "Approved as requested.",
    },
    {
      role: "Head of Department",
      name: "Michael Johnson",
      status: "approved",
      date: "2023-04-12T14:15:00Z",
      comments: "Approved. Please ensure receipts are submitted.",
    },
    {
      role: "Finance",
      name: approval.currentApprover,
      status: approval.status,
      date: approval.lastUpdated,
      comments: approval.status === "recap_needed" ? "Approved. Recap required within 5 days." : "",
    },
  ]

  const handleExportDetails = () => {
    // In a real implementation, this would generate a PDF with all details
    alert(`Exporting details for ${approval.requestId}...`)
  }

  const handleOverrideApproval = () => {
    setLoading(true)
    // In a real implementation, this would call an API to override the approval
    setTimeout(() => {
      setLoading(false)
      onOpenChange(false)
      alert(`Approval for ${approval.requestId} has been overridden.`)
    }, 1000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Approval Details: {approval.requestId}</span>
            {getStatusBadge(approval.status)}
          </DialogTitle>
          <DialogDescription>
            {approval.requestType} request submitted on {format(new Date(approval.submittedDate), "MMMM d, yyyy")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Requester</h3>
              <p>{approval.requester}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Department</h3>
              <p>{approval.department}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Amount</h3>
              <p>GHS {approval.amount.toFixed(2)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Current Approver</h3>
              <p>{approval.currentApprover}</p>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Approval Timeline</h3>
            <div className="space-y-6">
              {approvalTimeline.map((step, index) => (
                <div key={index} className="flex">
                  <div className="mr-4 flex flex-col items-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-muted bg-background">
                      {getStatusIcon(step.status)}
                    </div>
                    {index < approvalTimeline.length - 1 && <div className="h-full w-px bg-muted" />}
                  </div>
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium leading-none">
                        {step.role}: {step.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{format(new Date(step.date), "MMM d, yyyy")}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {step.status === "approved" && "Approved"}
                      {step.status === "pending" && "Pending approval"}
                      {step.status === "rejected" && "Rejected"}
                      {step.status === "recap_needed" && "Approved (Recap needed)"}
                    </p>
                    {step.comments && <p className="text-sm">"{step.comments}"</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Attachments</h3>
            <div className="flex items-center">
              <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm">receipt.pdf</span>
              <Button variant="ghost" size="sm" className="ml-auto h-8 w-8 p-0">
                <Download className="h-4 w-4" />
                <span className="sr-only">Download</span>
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={handleExportDetails}>
            <Download className="h-4 w-4 mr-2" />
            Export Details
          </Button>
          {approval.status !== "approved" && (
            <Button onClick={handleOverrideApproval} disabled={loading}>
              {loading ? "Processing..." : "Override Approval"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
