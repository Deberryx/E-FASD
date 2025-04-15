import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SecuritySettings } from "@/components/admin/security-settings"

export default function SecuritySettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">Security Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Security Configuration</CardTitle>
          <CardDescription>Manage authentication, roles, and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <SecuritySettings />
        </CardContent>
      </Card>
    </div>
  )
}
