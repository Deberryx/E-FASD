import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ApprovalFlowsTable } from "@/components/admin/approval-flows-table"
import { ApprovalStats } from "@/components/admin/approval-stats"

export default function ApprovalFlowsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">Approval Flows</h1>

      <ApprovalStats />

      <Card>
        <CardHeader>
          <CardTitle>Approval Requests</CardTitle>
          <CardDescription>Track and manage approval flows across departments</CardDescription>
        </CardHeader>
        <CardContent>
          <ApprovalFlowsTable />
        </CardContent>
      </Card>
    </div>
  )
}
