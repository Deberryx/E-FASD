import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DepartmentManagementTable } from "@/components/admin/department-management-table"

export default function DepartmentManagementPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">Department Management</h1>

      <Card>
        <CardHeader>
          <CardTitle>Departments</CardTitle>
          <CardDescription>Manage departments and assign department heads</CardDescription>
        </CardHeader>
        <CardContent>
          <DepartmentManagementTable />
        </CardContent>
      </Card>
    </div>
  )
}
