"use client"

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
import { AlertCircle, AlertTriangle, Info } from "lucide-react"

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

interface ErrorDetailsDialogProps {
  error: ErrorLog
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ErrorDetailsDialog({ error, open, onOpenChange }: ErrorDetailsDialogProps) {
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

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertCircle className="h-5 w-5 text-destructive" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />
      case "info":
        return <Info className="h-5 w-5 text-muted-foreground" />
      default:
        return <Info className="h-5 w-5 text-muted-foreground" />
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getSeverityIcon(error.severity)}
            <span>Error Details</span>
            {getSeverityBadge(error.severity)}
          </DialogTitle>
          <DialogDescription>
            {error.errorType} occurred on {format(new Date(error.timestamp), "MMMM d, yyyy HH:mm:ss")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Error Message</h3>
            <p className="text-sm">{error.message}</p>
          </div>

          {error.stackTrace && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Stack Trace</h3>
              <pre className="text-xs bg-muted p-4 rounded-md overflow-auto max-h-40">{error.stackTrace}</pre>
            </div>
          )}

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            {error.userId && (
              <>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">User ID</h3>
                  <p className="text-sm">{error.userId}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">User Name</h3>
                  <p className="text-sm">{error.userName || "N/A"}</p>
                </div>
              </>
            )}

            {error.requestInfo && (
              <>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Request Method</h3>
                  <p className="text-sm">{error.requestInfo.method}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Request URL</h3>
                  <p className="text-sm">{error.requestInfo.url}</p>
                </div>
              </>
            )}
          </div>

          {error.requestInfo?.body && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Request Body</h3>
              <pre className="text-xs bg-muted p-4 rounded-md overflow-auto max-h-40">
                {JSON.stringify(error.requestInfo.body, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
