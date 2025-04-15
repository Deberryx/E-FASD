"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Edit, Plus, Search, Users } from "lucide-react"
import { DepartmentDialog } from "@/components/admin/department-dialog"
import { Skeleton } from "@/components/ui/skeleton"

interface Department {
  id: string
  name: string
  code: string
  description: string
  headId: string | null
  headName: string | null
  memberCount: number
}

export function DepartmentManagementTable() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showDepartmentDialog, setShowDepartmentDialog] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null)

  useEffect(() => {
    async function fetchDepartments() {
      try {
        const response = await fetch("/api/admin/departments")
        if (response.ok) {
          const data = await response.json()
          setDepartments(data)
          setFilteredDepartments(data)
        }
      } catch (error) {
        console.error("Error fetching departments:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDepartments()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = departments.filter(
        (dept) =>
          dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dept.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dept.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (dept.headName && dept.headName.toLowerCase().includes(searchTerm.toLowerCase())),
      )
      setFilteredDepartments(filtered)
    } else {
      setFilteredDepartments(departments)
    }
  }, [searchTerm, departments])

  const handleAddDepartment = () => {
    setSelectedDepartment(null)
    setShowDepartmentDialog(true)
  }

  const handleEditDepartment = (department: Department) => {
    setSelectedDepartment(department)
    setShowDepartmentDialog(true)
  }

  const handleDepartmentSubmit = async (departmentData: any) => {
    try {
      if (selectedDepartment) {
        // Update existing department
        const response = await fetch(`/api/admin/departments/${selectedDepartment.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(departmentData),
        })

        if (response.ok) {
          const updatedDepartment = await response.json()
          setDepartments(departments.map((dept) => (dept.id === selectedDepartment.id ? updatedDepartment : dept)))
        }
      } else {
        // Create new department
        const response = await fetch("/api/admin/departments", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(departmentData),
        })

        if (response.ok) {
          const newDepartment = await response.json()
          setDepartments([...departments, newDepartment])
        }
      }
    } catch (error) {
      console.error("Error saving department:", error)
    }

    setShowDepartmentDialog(false)
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 w-full max-w-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search departments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9"
          />
        </div>
        <Button onClick={handleAddDepartment} className="h-9 gap-1">
          <Plus className="h-4 w-4" />
          Add Department
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Department Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Department Head</TableHead>
              <TableHead>Members</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDepartments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                  No departments found
                </TableCell>
              </TableRow>
            ) : (
              filteredDepartments.map((department) => (
                <TableRow key={department.id}>
                  <TableCell className="font-medium">{department.name}</TableCell>
                  <TableCell>{department.code}</TableCell>
                  <TableCell>
                    {department.headName || <span className="text-muted-foreground italic">Not assigned</span>}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{department.memberCount}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleEditDepartment(department)}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {showDepartmentDialog && (
        <DepartmentDialog
          department={selectedDepartment}
          open={showDepartmentDialog}
          onOpenChange={setShowDepartmentDialog}
          onSubmit={handleDepartmentSubmit}
        />
      )}
    </div>
  )
}
