"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Edit, Lock, Unlock, UserPlus } from "lucide-react"
import { UserDialog } from "@/components/user-dialog"

export default function UsersPage() {
  const [showUserDialog, setShowUserDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)

  // Mock data - in a real app, this would come from API
  const [users] = useState([
    {
      id: "1",
      name: "John Doe",
      email: "john.doe@organization.com",
      badge: "EMP001",
      department: "Administrative and HR",
      role: "User",
      status: "active",
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane.smith@organization.com",
      badge: "EMP002",
      department: "Programs",
      role: "Supervisor",
      status: "active",
    },
    {
      id: "3",
      name: "Michael Johnson",
      email: "michael.johnson@organization.com",
      badge: "EMP003",
      department: "Executive",
      role: "Head of Department",
      status: "active",
    },
    {
      id: "4",
      name: "Sarah Williams",
      email: "sarah.williams@organization.com",
      badge: "EMP004",
      department: "Finance",
      role: "Finance User Group",
      status: "active",
    },
    {
      id: "5",
      name: "Robert Brown",
      email: "robert.brown@organization.com",
      badge: "EMP005",
      department: "Monitoring and Evaluation",
      role: "User",
      status: "locked",
    },
  ])

  const handleAddUser = () => {
    setSelectedUser(null)
    setShowUserDialog(true)
  }

  const handleEditUser = (user: any) => {
    setSelectedUser(user)
    setShowUserDialog(true)
  }

  const handleUserSubmit = (userData: any) => {
    // In a real app, this would submit to an API
    console.log(userData)
    setShowUserDialog(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
        <Button onClick={handleAddUser}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>Manage user accounts and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Badge</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.badge}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.department}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    {user.status === "active" ? (
                      <Badge className="bg-green-500">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Locked</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      {user.status === "active" ? (
                        <Button variant="ghost" size="sm">
                          <Lock className="h-4 w-4" />
                          <span className="sr-only">Lock</span>
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm">
                          <Unlock className="h-4 w-4" />
                          <span className="sr-only">Unlock</span>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {showUserDialog && (
        <UserDialog
          user={selectedUser}
          open={showUserDialog}
          onOpenChange={setShowUserDialog}
          onSubmit={handleUserSubmit}
        />
      )}
    </div>
  )
}
