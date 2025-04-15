import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ErrorLogsTable } from "@/components/admin/error-logs-table"
import { ErrorStats } from "@/components/admin/error-stats"

export default function ErrorLogsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">Error Logs</h1>

      <ErrorStats />

      <Card>
        <CardHeader>
          <CardTitle>System Error Logs</CardTitle>
          <CardDescription>Monitor and troubleshoot system errors</CardDescription>
        </CardHeader>
        <CardContent>
          <ErrorLogsTable />
        </CardContent>
      </Card>
    </div>
  )
}
