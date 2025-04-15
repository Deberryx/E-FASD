"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function SystemSettings() {
  const [loading, setLoading] = useState(false)

  // Thresholds & Limits
  const [pettyCashLimit, setPettyCashLimit] = useState("500")
  const [requisitionApprovalThreshold, setRequisitionApprovalThreshold] = useState("5000")
  const [recapDeadlineDays, setRecapDeadlineDays] = useState("5")
  const [maxFileUploadSize, setMaxFileUploadSize] = useState("5")

  // Notifications
  const [enableEmailNotifications, setEnableEmailNotifications] = useState(true)
  const [enableInAppNotifications, setEnableInAppNotifications] = useState(true)
  const [notificationEmailTemplate, setNotificationEmailTemplate] = useState(
    "Dear {{user}},\n\nYour {{requestType}} request ({{requestId}}) has been {{status}}.\n\nThank you for using the E-Cash Request System.",
  )

  // Maintenance
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [maintenanceMessage, setMaintenanceMessage] = useState(
    "The system is currently undergoing scheduled maintenance. Please try again later.",
  )
  const [backupFrequency, setBackupFrequency] = useState("daily")

  const handleSaveThresholds = () => {
    setLoading(true)
    // In a real implementation, this would call an API to save the settings
    setTimeout(() => {
      setLoading(false)
      alert("Thresholds and limits saved successfully!")
    }, 1000)
  }

  const handleSaveNotifications = () => {
    setLoading(true)
    // In a real implementation, this would call an API to save the settings
    setTimeout(() => {
      setLoading(false)
      alert("Notification settings saved successfully!")
    }, 1000)
  }

  const handleSaveMaintenance = () => {
    setLoading(true)
    // In a real implementation, this would call an API to save the settings
    setTimeout(() => {
      setLoading(false)
      alert("Maintenance settings saved successfully!")
    }, 1000)
  }

  return (
    <Tabs defaultValue="thresholds">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="thresholds">Thresholds & Limits</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
      </TabsList>

      <TabsContent value="thresholds" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Thresholds & Limits</CardTitle>
            <CardDescription>Configure system-wide thresholds and limits</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="petty-cash-limit">Petty Cash Limit (GHS)</Label>
              <Input
                id="petty-cash-limit"
                type="number"
                value={pettyCashLimit}
                onChange={(e) => setPettyCashLimit(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Maximum amount allowed for petty cash requests</p>
            </div>

            <Separator />

            <div className="grid gap-2">
              <Label htmlFor="requisition-threshold">Requisition Approval Threshold (GHS)</Label>
              <Input
                id="requisition-threshold"
                type="number"
                value={requisitionApprovalThreshold}
                onChange={(e) => setRequisitionApprovalThreshold(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Requisitions above this amount require additional approval
              </p>
            </div>

            <Separator />

            <div className="grid gap-2">
              <Label htmlFor="recap-deadline">Recap Deadline (days)</Label>
              <Input
                id="recap-deadline"
                type="number"
                value={recapDeadlineDays}
                onChange={(e) => setRecapDeadlineDays(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Number of days allowed for submitting recaps</p>
            </div>

            <Separator />

            <div className="grid gap-2">
              <Label htmlFor="max-file-size">Maximum File Upload Size (MB)</Label>
              <Input
                id="max-file-size"
                type="number"
                value={maxFileUploadSize}
                onChange={(e) => setMaxFileUploadSize(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Maximum size for file attachments</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSaveThresholds} disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="notifications" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>Configure system notifications and templates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-xs text-muted-foreground">Send email notifications for important events</p>
              </div>
              <Switch
                id="email-notifications"
                checked={enableEmailNotifications}
                onCheckedChange={setEnableEmailNotifications}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="in-app-notifications">In-App Notifications</Label>
                <p className="text-xs text-muted-foreground">Show notifications within the application</p>
              </div>
              <Switch
                id="in-app-notifications"
                checked={enableInAppNotifications}
                onCheckedChange={setEnableInAppNotifications}
              />
            </div>

            <Separator />

            <div className="grid gap-2">
              <Label htmlFor="email-template">Email Notification Template</Label>
              <Textarea
                id="email-template"
                value={notificationEmailTemplate}
                onChange={(e) => setNotificationEmailTemplate(e.target.value)}
                rows={6}
              />
              <p className="text-xs text-muted-foreground">
                Template for email notifications. Use {{ user }}, {{ requestId }}, {{ requestType }}, {{ status }},{" "}
                {{ amount }}, {{ date }} for dynamic content.
              </p>
            </div>

            <div className="bg-muted p-4 rounded-md">
              <h4 className="text-sm font-medium mb-2">Available Variables</h4>
              <ul className="text-xs space-y-1">
                <li>
                  <code>{{ user }}</code> - User's name
                </li>
                <li>
                  <code>{{ requestId }}</code> - Request ID
                </li>
                <li>
                  <code>{{ requestType }}</code> - Type of request
                </li>
                <li>
                  <code>{{ status }}</code> - Request status
                </li>
                <li>
                  <code>{{ amount }}</code> - Request amount
                </li>
                <li>
                  <code>{{ date }}</code> - Request date
                </li>
              </ul>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSaveNotifications} disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="maintenance" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Maintenance Settings</CardTitle>
            <CardDescription>Configure system maintenance and backups</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                <p className="text-xs text-muted-foreground">
                  Put the system in maintenance mode (users will see a maintenance message)
                </p>
              </div>
              <Switch id="maintenance-mode" checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
            </div>

            <Separator />

            <div className="grid gap-2">
              <Label htmlFor="maintenance-message">Maintenance Message</Label>
              <Textarea
                id="maintenance-message"
                value={maintenanceMessage}
                onChange={(e) => setMaintenanceMessage(e.target.value)}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">Message displayed to users during maintenance</p>
            </div>

            <Separator />

            <div className="grid gap-2">
              <Label htmlFor="backup-frequency">Database Backup Frequency</Label>
              <Select value={backupFrequency} onValueChange={setBackupFrequency}>
                <SelectTrigger id="backup-frequency">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">How often to back up the database</p>
            </div>

            <Separator />

            <div className="grid gap-2">
              <Label>Manual Backup</Label>
              <Button variant="outline" className="w-full">
                Create Backup Now
              </Button>
              <p className="text-xs text-muted-foreground">Create an immediate backup of the database</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSaveMaintenance} disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
