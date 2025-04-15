"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function SecuritySettings() {
  const [loading, setLoading] = useState(false)

  // Authentication settings
  const [sessionTimeout, setSessionTimeout] = useState("60")
  const [enforceSSO, setEnforceSSO] = useState(true)
  const [allowTestAccounts, setAllowTestAccounts] = useState(false)

  // Password policy
  const [minPasswordLength, setMinPasswordLength] = useState("8")
  const [requireSpecialChars, setRequireSpecialChars] = useState(true)
  const [requireNumbers, setRequireNumbers] = useState(true)
  const [passwordExpiryDays, setPasswordExpiryDays] = useState("90")

  // Role permissions
  const [defaultUserRole, setDefaultUserRole] = useState("User")

  const handleSaveAuthSettings = () => {
    setLoading(true)
    // In a real implementation, this would call an API to save the settings
    setTimeout(() => {
      setLoading(false)
      alert("Authentication settings saved successfully!")
    }, 1000)
  }

  const handleSavePasswordPolicy = () => {
    setLoading(true)
    // In a real implementation, this would call an API to save the settings
    setTimeout(() => {
      setLoading(false)
      alert("Password policy saved successfully!")
    }, 1000)
  }

  const handleSaveRolePermissions = () => {
    setLoading(true)
    // In a real implementation, this would call an API to save the settings
    setTimeout(() => {
      setLoading(false)
      alert("Role permissions saved successfully!")
    }, 1000)
  }

  return (
    <Tabs defaultValue="authentication">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="authentication">Authentication</TabsTrigger>
        <TabsTrigger value="password-policy">Password Policy</TabsTrigger>
        <TabsTrigger value="role-permissions">Role Permissions</TabsTrigger>
      </TabsList>

      <TabsContent value="authentication" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Settings</CardTitle>
            <CardDescription>Configure how users authenticate with the system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
              <Input
                id="session-timeout"
                type="number"
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">How long until an inactive session expires</p>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enforce-sso">Enforce Azure AD SSO</Label>
                <p className="text-xs text-muted-foreground">Require all users to sign in with Azure AD</p>
              </div>
              <Switch id="enforce-sso" checked={enforceSSO} onCheckedChange={setEnforceSSO} />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="allow-test-accounts">Allow Test Accounts</Label>
                <p className="text-xs text-muted-foreground">Enable non-Azure AD test accounts for development</p>
              </div>
              <Switch id="allow-test-accounts" checked={allowTestAccounts} onCheckedChange={setAllowTestAccounts} />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSaveAuthSettings} disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="password-policy" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Password Policy</CardTitle>
            <CardDescription>Configure password requirements and expiration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="min-password-length">Minimum Password Length</Label>
              <Input
                id="min-password-length"
                type="number"
                value={minPasswordLength}
                onChange={(e) => setMinPasswordLength(e.target.value)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="require-special-chars">Require Special Characters</Label>
                <p className="text-xs text-muted-foreground">Passwords must contain at least one special character</p>
              </div>
              <Switch
                id="require-special-chars"
                checked={requireSpecialChars}
                onCheckedChange={setRequireSpecialChars}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="require-numbers">Require Numbers</Label>
                <p className="text-xs text-muted-foreground">Passwords must contain at least one number</p>
              </div>
              <Switch id="require-numbers" checked={requireNumbers} onCheckedChange={setRequireNumbers} />
            </div>

            <Separator />

            <div className="grid gap-2">
              <Label htmlFor="password-expiry-days">Password Expiry (days)</Label>
              <Input
                id="password-expiry-days"
                type="number"
                value={passwordExpiryDays}
                onChange={(e) => setPasswordExpiryDays(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">How often users must change their password (0 = never)</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSavePasswordPolicy} disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="role-permissions" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Role Permissions</CardTitle>
            <CardDescription>Configure role-based access control</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="default-role">Default User Role</Label>
              <Select value={defaultUserRole} onValueChange={setDefaultUserRole}>
                <SelectTrigger id="default-role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="User">User</SelectItem>
                  <SelectItem value="Supervisor">Supervisor</SelectItem>
                  <SelectItem value="Head of Department">Head of Department</SelectItem>
                  <SelectItem value="Finance User Group">Finance User Group</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Default role assigned to new users</p>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Role Capabilities</h3>

              <div className="space-y-2">
                <h4 className="text-xs font-medium uppercase text-muted-foreground">User</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <Switch id="user-create-requests" defaultChecked />
                    <Label htmlFor="user-create-requests">Create Requests</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="user-view-own-requests" defaultChecked />
                    <Label htmlFor="user-view-own-requests">View Own Requests</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="user-submit-recaps" defaultChecked />
                    <Label htmlFor="user-submit-recaps">Submit Recaps</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-medium uppercase text-muted-foreground">Supervisor</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <Switch id="supervisor-approve-requests" defaultChecked />
                    <Label htmlFor="supervisor-approve-requests">Approve Requests</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="supervisor-view-department-requests" defaultChecked />
                    <Label htmlFor="supervisor-view-department-requests">View Department Requests</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-medium uppercase text-muted-foreground">Head of Department</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <Switch id="hod-approve-requests" defaultChecked />
                    <Label htmlFor="hod-approve-requests">Approve Requests</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="hod-view-department-reports" defaultChecked />
                    <Label htmlFor="hod-view-department-reports">View Department Reports</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-medium uppercase text-muted-foreground">Finance User Group</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <Switch id="finance-approve-requests" defaultChecked />
                    <Label htmlFor="finance-approve-requests">Approve Requests</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="finance-view-all-requests" defaultChecked />
                    <Label htmlFor="finance-view-all-requests">View All Requests</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="finance-generate-reports" defaultChecked />
                    <Label htmlFor="finance-generate-reports">Generate Reports</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-medium uppercase text-muted-foreground">Admin</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <Switch id="admin-manage-users" defaultChecked disabled />
                    <Label htmlFor="admin-manage-users">Manage Users</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="admin-manage-departments" defaultChecked disabled />
                    <Label htmlFor="admin-manage-departments">Manage Departments</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="admin-view-logs" defaultChecked disabled />
                    <Label htmlFor="admin-view-logs">View Logs</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="admin-configure-system" defaultChecked disabled />
                    <Label htmlFor="admin-configure-system">Configure System</Label>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSaveRolePermissions} disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
