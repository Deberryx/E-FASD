import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AuditLogsTable } from "@/components/admin/audit-logs-table"

export default function AuditLogsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">Audit Logs</h1>

      <Card>
        <CardHeader>
          <CardTitle>System Audit Trail</CardTitle>
          <CardDescription>Chronological record of all significant actions within the system</CardDescription>
        </CardHeader>
        <CardContent>
          <AuditLogsTable />
        </CardContent>
      </Card>
    </div>
  )
}
