"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePickerWithRange } from "@/components/date-range-picker"
import { BarChart, Download, FileText, Printer } from "lucide-react"
import { RequestsChart } from "@/components/requests-chart"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState({
    from: new Date(2023, 3, 1), // April 1, 2023
    to: new Date(2023, 3, 30), // April 30, 2023
  })

  // Mock data - in a real app, this would come from API
  const reportData = [
    {
      id: "REQ-001",
      type: "Petty Cash",
      date: "2023-04-01",
      amount: "450.00",
      user: "John Doe",
      department: "Administrative and HR",
      status: "approved",
    },
    {
      id: "REQ-002",
      type: "Requisition",
      date: "2023-04-03",
      amount: "1200.00",
      user: "Jane Smith",
      department: "Programs",
      status: "pending",
    },
    {
      id: "REQ-003",
      type: "Petty Cash",
      date: "2023-04-05",
      amount: "320.00",
      user: "Sarah Williams",
      department: "Monitoring and Evaluation",
      status: "rejected",
    },
    {
      id: "REQ-004",
      type: "Requisition",
      date: "2023-04-07",
      amount: "2500.00",
      user: "Michael Johnson",
      department: "Executive",
      status: "approved",
    },
    {
      id: "REQ-005",
      type: "Petty Cash",
      date: "2023-04-10",
      amount: "180.00",
      user: "Robert Brown",
      department: "Finance",
      status: "recap_needed",
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">Reports</h1>

      <div className="flex flex-col md:flex-row gap-4">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <DatePickerWithRange date={dateRange} setDate={setDateRange} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Department</label>
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="administrative">Administrative and HR</SelectItem>
                    <SelectItem value="monitoring">Monitoring and Evaluation</SelectItem>
                    <SelectItem value="executive">Executive</SelectItem>
                    <SelectItem value="programs">Programs</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Request Type</label>
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="petty_cash">Petty Cash</SelectItem>
                    <SelectItem value="requisition">Requisition</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="recap_needed">Recap Needed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end">
              <Button>Apply Filters</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full md:w-64">
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">Total Requests</div>
              <div className="text-2xl font-bold">5</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total Amount</div>
              <div className="text-2xl font-bold">GHS 4,650.00</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Approved Amount</div>
              <div className="text-2xl font-bold">GHS 2,950.00</div>
            </div>
            <div className="pt-2 flex flex-col gap-2">
              <Button variant="outline" className="w-full">
                <Printer className="mr-2 h-4 w-4" />
                Print Report
              </Button>
              <Button variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="table" className="w-full">
        <TabsList>
          <TabsTrigger value="table">
            <FileText className="h-4 w-4 mr-2" />
            Table View
          </TabsTrigger>
          <TabsTrigger value="chart">
            <BarChart className="h-4 w-4 mr-2" />
            Chart View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="table">
          <Card>
            <CardHeader>
              <CardTitle>Request Report</CardTitle>
              <CardDescription>Detailed report of all requests for the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Amount (GHS)</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.id}</TableCell>
                      <TableCell>{item.type}</TableCell>
                      <TableCell>{item.date}</TableCell>
                      <TableCell>{item.user}</TableCell>
                      <TableCell>{item.department}</TableCell>
                      <TableCell>{item.amount}</TableCell>
                      <TableCell>{item.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chart">
          <Card>
            <CardHeader>
              <CardTitle>Request Visualization</CardTitle>
              <CardDescription>Visual representation of requests by department and type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <RequestsChart />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
