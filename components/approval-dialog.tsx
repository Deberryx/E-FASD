"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, XCircle } from "lucide-react"

interface ApprovalDialogProps {
  request: any
  action: "approve" | "reject"
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (comments: string) => void
}

export function ApprovalDialog({ request, action, open, onOpenChange, onSubmit }: ApprovalDialogProps) {
  const [comments, setComments] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = () => {
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      onSubmit(comments)
      setIsSubmitting(false)
    }, 1000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {action === "approve" ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-500" />
                Approve Request
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-destructive" />
                Reject Request
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {action === "approve"
              ? "Confirm approval of this request"
              : "Please provide a reason for rejecting this request"}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="font-medium">Request ID:</div>
            <div className="col-span-3">{request.id}</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="font-medium">Type:</div>
            <div className="col-span-3">{request.type}</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="font-medium">Amount:</div>
            <div className="col-span-3">GHS {request.amount}</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="font-medium">Requester:</div>
            <div className="col-span-3">{request.user}</div>
          </div>
          <div>
            <label htmlFor="comments" className="block text-sm font-medium mb-2">
              Comments
            </label>
            <Textarea
              id="comments"
              placeholder={action === "approve" ? "Optional comments" : "Reason for rejection (required)"}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || (action === "reject" && !comments)}
            variant={action === "approve" ? "default" : "destructive"}
          >
            {isSubmitting ? "Processing..." : action === "approve" ? "Approve" : "Reject"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
