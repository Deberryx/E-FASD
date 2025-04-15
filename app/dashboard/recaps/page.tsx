"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, FileText } from "lucide-react"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function RecapsPage() {
  // Mock data - in a real app, this would come from API
  const pendingRecaps = [
    {
      id: "REQ-005",
      type: "Petty Cash",
      date: "2023-04-10",
      amount: "180.00",
      user: "John Doe",
      department: "Finance",
      dueDate: "2023-04-15",
    },
  ]

  const completedRecaps = [
    {
      id: "REQ-001",
      type: "Petty Cash",
      date: "2023-04-01",
      amount: "450.00",
      user: "John Doe",
      department: "Administrative and HR",
      recapDate: "2023-04-03",
      status: "completed",
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">Recaps</h1>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Recaps</CardTitle>
              <CardDescription>Requests that require recap submission</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingRecaps.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Request ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount (GHS)</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingRecaps.map((recap) => (
                      <TableRow key={recap.id}>
                        <TableCell className="font-medium">{recap.id}</TableCell>
                        <TableCell>{recap.type}</TableCell>
                        <TableCell>{recap.date}</TableCell>
                        <TableCell>{recap.amount}</TableCell>
                        <TableCell>{recap.department}</TableCell>
                        <TableCell>
                          <span className="text-amber-500 font-medium">{recap.dueDate}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/dashboard/requests/${recap.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </Link>
                            <Link href={`/dashboard/requests/${recap.id}?recap=true`}>
                              <Button size="sm">
                                <FileText className="h-4 w-4 mr-1" />
                                Submit Recap
                              </Button>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-6 text-muted-foreground">No pending recaps</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>Completed Recaps</CardTitle>
              <CardDescription>History of submitted recaps</CardDescription>
            </CardHeader>
            <CardContent>
              {completedRecaps.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Request ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Request Date</TableHead>
                      <TableHead>Amount (GHS)</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Recap Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {completedRecaps.map((recap) => (
                      <TableRow key={recap.id}>
                        <TableCell className="font-medium">{recap.id}</TableCell>
                        <TableCell>{recap.type}</TableCell>
                        <TableCell>{recap.date}</TableCell>
                        <TableCell>{recap.amount}</TableCell>
                        <TableCell>{recap.department}</TableCell>
                        <TableCell>{recap.recapDate}</TableCell>
                        <TableCell className="text-right">
                          <Link href={`/dashboard/requests/${recap.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-6 text-muted-foreground">No completed recaps</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
