"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Edit, Lock, Unlock, UserPlus, Search, Filter, Loader2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserDialog } from "@/components/user-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { fetchAllUsers } from "@/app/actions/db-actions"

interface User {
  id: string
  name: string
  email: string
  badge: string
  department: string
  role: string
  status: "active" | "locked"
}

export function UserManagementTable() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showUserDialog, setShowUserDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()

  async function loadUsers() {
    try {
      setLoading(true)
      setError(null)

      // Use server action instead of direct API call
      const data = await fetchAllUsers()

      // Transform the data to match our component's expected format
      const formattedUsers = data.map((user: any) => ({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        badge: user.badge_number,
        department: user.department,
        role: user.role,
        status: user.status,
      }))

      setUsers(formattedUsers)
      setFilteredUsers(formattedUsers)
    } catch (error: any) {
      console.error("Error fetching users:", error)
      setError(error.message || "Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.badge.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.role.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredUsers(filtered)
    } else {
      setFilteredUsers(users)
    }
  }, [searchTerm, users])

  const handleAddUser = () => {
    setSelectedUser(null)
    setShowUserDialog(true)
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setShowUserDialog(true)
  }

  const handleUserSubmit = async (userData: any) => {
    try {
      setIsProcessing(true)

      if (selectedUser) {
        // Update existing user
        const response = await fetch(`/api/users/${selectedUser.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to update user")
        }

        // Refresh the user list after successful update
        await loadUsers()
        toast({
          title: "Success",
          description: "User updated successfully",
        })
      } else {
        // Create new user
        const response = await fetch("/api/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to create user")
        }

        // Refresh the user list after successful creation
        await loadUsers()
        toast({
          title: "Success",
          description: "User created successfully",
        })
      }
    } catch (error: any) {
      console.error("Error saving user:", error)
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
      setShowUserDialog(false)
    }
  }

  const handleToggleUserStatus = async (user: User) => {
    try {
      setIsProcessing(true)
      const newStatus = user.status === "active" ? "locked" : "active"

      const response = await fetch(`/api/users/${user.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update user status")
      }

      // Refresh the user list after successful status update
      await loadUsers()
      toast({
        title: "Success",
        description: `User ${newStatus === "active" ? "activated" : "locked"} successfully`,
      })
    } catch (error: any) {
      console.error("Error toggling user status:", error)
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between">
          <Skeleton className="h-10 w-[250px]" />
          <Skeleton className="h-10 w-[100px]" />
        </div>
        <div className="border rounded-md">
          <div className="h-10 border-b px-4 py-2">
            <Skeleton className="h-5 w-full" />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 border-b px-4 py-2">
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error}
          <div className="mt-2">
            <Button onClick={loadUsers} size="sm" variant="outline" className="gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Retry
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 w-full max-w-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setFilteredUsers(users)}>All Users</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilteredUsers(users.filter((u) => u.status === "active"))}>
                Active Users
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilteredUsers(users.filter((u) => u.status === "locked"))}>
                Locked Users
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setFilteredUsers(users.filter((u) => u.role === "Admin"))}>
                Admins
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilteredUsers(users.filter((u) => u.role === "Finance User Group"))}>
                Finance Users
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilteredUsers(users.filter((u) => u.role === "Head of Department"))}>
                Department Heads
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilteredUsers(users.filter((u) => u.role === "Supervisor"))}>
                Supervisors
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilteredUsers(users.filter((u) => u.role === "User"))}>
                Regular Users
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={handleAddUser} className="h-9 gap-1" disabled={isProcessing}>
            <UserPlus className="h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      <div className="border rounded-md">
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
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
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
                      <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)} disabled={isProcessing}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleUserStatus(user)}
                        disabled={isProcessing}
                      >
                        {user.status === "active" ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                        <span className="sr-only">{user.status === "active" ? "Lock" : "Unlock"}</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {showUserDialog && (
        <UserDialog
          user={selectedUser}
          open={showUserDialog}
          onOpenChange={setShowUserDialog}
          onSubmit={handleUserSubmit}
          isProcessing={isProcessing}
        />
      )}
    </div>
  )
}
