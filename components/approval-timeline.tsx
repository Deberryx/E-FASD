import { CheckCircle2, Clock, XCircle } from "lucide-react"

interface Approval {
  role: string
  name: string
  status: string
  date: string
  comments?: string
}

interface ApprovalTimelineProps {
  approvals: Approval[]
}

export function ApprovalTimeline({ approvals }: ApprovalTimelineProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "pending":
        return <Clock className="h-5 w-5 text-muted-foreground" />
      case "rejected":
        return <XCircle className="h-5 w-5 text-destructive" />
      case "recap_needed":
        return <CheckCircle2 className="h-5 w-5 text-amber-500" />
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />
    }
  }

  return (
    <div className="space-y-6">
      {approvals.map((approval, index) => (
        <div key={index} className="flex">
          <div className="mr-4 flex flex-col items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-muted bg-background">
              {getStatusIcon(approval.status)}
            </div>
            {index < approvals.length - 1 && <div className="h-full w-px bg-muted" />}
          </div>
          <div className="space-y-1 pt-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium leading-none">
                {approval.role}: {approval.name}
              </p>
              <p className="text-xs text-muted-foreground">{approval.date}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              {approval.status === "approved" && "Approved"}
              {approval.status === "pending" && "Pending approval"}
              {approval.status === "rejected" && "Rejected"}
              {approval.status === "recap_needed" && "Approved (Recap needed)"}
            </p>
            {approval.comments && <p className="text-sm">"{approval.comments}"</p>}
          </div>
        </div>
      ))}
    </div>
  )
}
