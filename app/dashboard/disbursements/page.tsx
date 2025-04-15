"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, CreditCard, CheckCircle, Clock } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DisbursementDialog } from "@/components/disbursement-dialog"
import { useToast } from "@/hooks/use-toast"

export default function DisbursementsPage() {
  const [pendingDisbursements, setPendingDisbursements] = useState([
    {
      id: "REQ-001",
      requestId: "REQ-001",
      requester: "John Doe",
      department: "Administrative and HR",
      amount: "450.00",
      approvedDate: "2023-04-02",
      status: "pending",
    },
    {
      id: "REQ-004",
      requestId: "REQ-004",
      requester: "Michael Johnson",
      department: "Executive",
      amount: "2500.00",
      approvedDate: "2023-04-08",
      status: "pending",
    },
  ])

  const [completedDisbursements, setCompletedDisbursements] = useState([
    {
      id: "REQ-002",
      requestId: "REQ-002",
      requester: "Jane Smith",
      department: "Programs",
      amount: "1200.00",
      approvedDate: "2023-04-05",
      disbursedDate: "2023-04-06",
      disbursedBy: "Finance Officer",
      status: "completed",
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDisbursement, setSelectedDisbursement] = useState(null)
  const [showDisbursementDialog, setShowDisbursementDialog] = useState(false)
  const { toast } = useToast()

  const handleProcess = (disbursement) => {
    setSelectedDisbursement(disbursement)
    setShowDisbursementDialog(true)
  }

  const handleDisbursementComplete = (data) => {
    // In a real app, this would call an API
    toast({
      title: "Disbursement Processed",
      description: `Disbursement for ${selectedDisbursement.requestId} has been processed successfully.`,
    })

    // Update the lists
    setPendingDisbursements(pendingDisbursements.filter((d) => d.id !== selectedDisbursement.id))
    setCompletedDisbursements([
      ...completedDisbursements,
      {
        ...selectedDisbursement,
        status: "completed",
        disbursedDate: new Date().toISOString().split("T")[0],
        disbursedBy: "Current User",
        verificationCode: data.verificationCode,
      },
    ])

    setShowDisbursementDialog(false)
  }

  // Filter disbursements based on search term
  const filteredPending = pendingDisbursements.filter(
    (d) =>
      d.requestId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.requester.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.department.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredCompleted = completedDisbursements.filter(
    (d) =>
      d.requestId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.requester.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.department.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">Disbursements</h1>

      <div className="flex items-center gap-2 w-full max-w-sm">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search disbursements..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-9"
        />
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Disbursements</CardTitle>
              <CardDescription>Approved requests awaiting disbursement</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredPending.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Request ID</TableHead>
                      <TableHead>Requester</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Amount (GHS)</TableHead>
                      <TableHead>Approved Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPending.map((disbursement) => (
                      <TableRow key={disbursement.id}>
                        <TableCell className="font-medium">{disbursement.requestId}</TableCell>
                        <TableCell>{disbursement.requester}</TableCell>
                        <TableCell>{disbursement.department}</TableCell>
                        <TableCell>{disbursement.amount}</TableCell>
                        <TableCell>{disbursement.approvedDate}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Pending
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" onClick={() => handleProcess(disbursement)}>
                            <CreditCard className="h-4 w-4 mr-2" />
                            Process
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-6 text-muted-foreground">No pending disbursements found</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>Completed Disbursements</CardTitle>
              <CardDescription>History of processed disbursements</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredCompleted.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Request ID</TableHead>
                      <TableHead>Requester</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Amount (GHS)</TableHead>
                      <TableHead>Disbursed Date</TableHead>
                      <TableHead>Disbursed By</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCompleted.map((disbursement) => (
                      <TableRow key={disbursement.id}>
                        <TableCell className="font-medium">{disbursement.requestId}</TableCell>
                        <TableCell>{disbursement.requester}</TableCell>
                        <TableCell>{disbursement.department}</TableCell>
                        <TableCell>{disbursement.amount}</TableCell>
                        <TableCell>{disbursement.disbursedDate}</TableCell>
                        <TableCell>{disbursement.disbursedBy}</TableCell>
                        <TableCell>
                          <Badge className="bg-green-500 flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Completed
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-6 text-muted-foreground">No completed disbursements found</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {showDisbursementDialog && selectedDisbursement && (
        <DisbursementDialog
          disbursement={selectedDisbursement}
          open={showDisbursementDialog}
          onOpenChange={setShowDisbursementDialog}
          onComplete={handleDisbursementComplete}
        />
      )}
    </div>
  )
}
