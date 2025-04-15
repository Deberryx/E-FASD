"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"

export function UserSettings() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Profile settings
  const [name, setName] = useState(session?.user?.name || "")
  const [email, setEmail] = useState(session?.user?.email || "")

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [inAppNotifications, setInAppNotifications] = useState(true)
  const [approvalNotifications, setApprovalNotifications] = useState(true)
  const [recapReminders, setRecapReminders] = useState(true)

  // Display settings
  const [compactMode, setCompactMode] = useState(false)
  const [showAmounts, setShowAmounts] = useState(true)

  const handleSaveProfile = () => {
    setLoading(true)
    // In a real implementation, this would call an API to save the settings
    setTimeout(() => {
      setLoading(false)
      toast({
        title: "Profile Updated",
        description: "Your profile settings have been saved successfully.",
      })
    }, 1000)
  }

  const handleSaveNotifications = () => {
    setLoading(true)
    // In a real implementation, this would call an API to save the settings
    setTimeout(() => {
      setLoading(false)
      toast({
        title: "Notification Settings Updated",
        description: "Your notification preferences have been saved.",
      })
    }, 1000)
  }

  const handleSaveDisplay = () => {
    setLoading(true)
    // In a real implementation, this would call an API to save the settings
    setTimeout(() => {
      setLoading(false)
      toast({
        title: "Display Settings Updated",
        description: "Your display preferences have been saved.",
      })
    }, 1000)
  }

  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="display">Display</TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>Manage your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
              />
              <p className="text-xs text-muted-foreground">
                This email will be used for notifications and communications.
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="badge">Badge Number</Label>
              <Input id="badge" value={session?.user?.badge_number || ""} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">
                Badge number cannot be changed. Contact an administrator if needed.
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="department">Department</Label>
              <Input id="department" value={session?.user?.department || ""} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">
                Department cannot be changed. Contact an administrator if needed.
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Input id="role" value={session?.user?.role || ""} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">
                Role cannot be changed. Contact an administrator if needed.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSaveProfile} disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="notifications" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>Manage how you receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-xs text-muted-foreground">Receive notifications via email</p>
              </div>
              <Switch id="email-notifications" checked={emailNotifications} onCheckedChange={setEmailNotifications} />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="in-app-notifications">In-App Notifications</Label>
                <p className="text-xs text-muted-foreground">Show notifications within the application</p>
              </div>
              <Switch id="in-app-notifications" checked={inAppNotifications} onCheckedChange={setInAppNotifications} />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="approval-notifications">Approval Notifications</Label>
                <p className="text-xs text-muted-foreground">
                  Receive notifications when your requests are approved or rejected
                </p>
              </div>
              <Switch
                id="approval-notifications"
                checked={approvalNotifications}
                onCheckedChange={setApprovalNotifications}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="recap-reminders">Recap Reminders</Label>
                <p className="text-xs text-muted-foreground">Receive reminders when recaps are due</p>
              </div>
              <Switch id="recap-reminders" checked={recapReminders} onCheckedChange={setRecapReminders} />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSaveNotifications} disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="display" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Display Settings</CardTitle>
            <CardDescription>Customize how the application looks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="compact-mode">Compact Mode</Label>
                <p className="text-xs text-muted-foreground">Use a more compact layout to fit more content on screen</p>
              </div>
              <Switch id="compact-mode" checked={compactMode} onCheckedChange={setCompactMode} />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="show-amounts">Show Amounts</Label>
                <p className="text-xs text-muted-foreground">Show monetary amounts in the dashboard and lists</p>
              </div>
              <Switch id="show-amounts" checked={showAmounts} onCheckedChange={setShowAmounts} />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSaveDisplay} disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
