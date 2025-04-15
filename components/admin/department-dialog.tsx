"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface User {
  id: string
  name: string
  email: string
  role: string
}

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Department name must be at least 2 characters",
  }),
  code: z.string().min(2, {
    message: "Department code must be at least 2 characters",
  }),
  description: z.string().optional(),
  headId: z.string().optional(),
})

interface DepartmentDialogProps {
  department: {
    id: string
    name: string
    code: string
    description: string
    headId: string | null
  } | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: z.infer<typeof formSchema>) => void
}

export function DepartmentDialog({ department, open, onOpenChange, onSubmit }: DepartmentDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [users, setUsers] = useState<User[]>([])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: department
      ? {
          name: department.name,
          code: department.code,
          description: department.description || "",
          headId: department.headId || undefined,
        }
      : {
          name: "",
          code: "",
          description: "",
          headId: undefined,
        },
  })

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch("/api/users")
        if (response.ok) {
          const data = await response.json()
          // Filter users who can be department heads (e.g., not regular users)
          const eligibleUsers = data.filter(
            (user: User) => user.role === "Head of Department" || user.role === "Supervisor" || user.role === "Admin",
          )
          setUsers(eligibleUsers)
        }
      } catch (error) {
        console.error("Error fetching users:", error)
      }
    }

    fetchUsers()
  }, [])

  function handleSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      onSubmit(values)
      setIsSubmitting(false)
    }, 1000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{department ? "Edit Department" : "Add New Department"}</DialogTitle>
          <DialogDescription>
            {department ? "Update department details and head" : "Create a new department"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Finance" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department Code</FormLabel>
                  <FormControl>
                    <Input placeholder="FIN" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Department description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="headId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department Head</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department head" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : department ? "Save Changes" : "Create Department"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
