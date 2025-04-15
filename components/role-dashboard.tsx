"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, Clock, CheckCircle, AlertCircle, FileText, Users, BarChart3, CreditCard } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/client-utils" // Updated import

interface RoleDashboardProps {
  userRole: string
  userName: string
  userDepartment: string
}

export function RoleDashboard({ userRole, userName, userDepartment }: RoleDashboardProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<any>({
    openRequests: 0,
    recapsDue: 0,
    pendingApprovals: 0,
    teamSummary: { open: 0, approved: 0, rejected: 0 },
    departmentKPIs: { totalRequests: 0, approvalRate: 0, avgTurnaround: 0 },
    pendingAdminApprovals: 0,
    pendingGRCReviews: 0,
    recapsPendingCheck: 0,
    pendingFinanceApprovals: 0,
    requestsAwaitingDisbursement: 0,
  })

  useEffect(() => {
    // In a real app, this would fetch data from the API
    // For now, we'll simulate loading and set mock data
    const timer = setTimeout(() => {
      setDashboardData({
        openRequests: 3,
        recapsDue: 1,
        pendingApprovals: 5,
        teamSummary: { open: 7, approved: 12, rejected: 2 },
        departmentKPIs: { totalRequests: 25, approvalRate: 85, avgTurnaround: 2.3 },
        pendingAdminApprovals: 8,
        pendingGRCReviews: 4,
        recapsPendingCheck: 6,
        pendingFinanceApprovals: 9,
        requestsAwaitingDisbursement: 3,
      })
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Render different dashboards based on user role
  const renderDashboard = () => {
    switch (userRole) {
      case "User":
        return renderUserDashboard()
      case "Supervisor":
        return renderSupervisorDashboard()
      case "Head of Department":
        return renderHeadOfDepartmentDashboard()
      case "Head of Admin & HR":
        return renderHeadAdminHRDashboard()
      case "GRC Manager":
        return renderGRCManagerDashboard()
      case "Accounts Officer":
        return renderAccountsOfficerDashboard()
      case "Head of Finance":
        return renderHeadFinanceDashboard()
      case "Finance User Group":
        return renderFinanceUserGroupDashboard()
      case "Disburser":
        return renderDisburserDashboard()
      case "Admin":
        return renderAdminDashboard()
      default:
        return renderUserDashboard() // Default to User dashboard
    }
  }

  // User Dashboard
  const renderUserDashboard = () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <DashboardCard
        title="My Open Requests"
        description="Your active requests"
        value={dashboardData.openRequests.toString()}
        icon={<FileText className="h-5 w-5 text-blue-500" />}
        loading={loading}
        link="/dashboard/requests"
      />
      <DashboardCard
        title="Recaps Due"
        description="Recaps requiring your attention"
        value={dashboardData.recapsDue.toString()}
        icon={<Clock className="h-5 w-5 text-amber-500" />}
        loading={loading}
        link="/dashboard/recaps"
        alert={dashboardData.recapsDue > 0}
      />
      <DashboardCard
        title="Recent Activity"
        description="Your latest actions"
        content={
          <div className="space-y-2">
            {loading ? (
              Array(3)
                .fill(0)
                .map((_, i) => <div key={i} className="h-5 bg-muted animate-pulse rounded" />)
            ) : (
              <>
                <p className="text-sm">Petty Cash request approved</p>
                <p className="text-sm">Submitted new requisition</p>
                <p className="text-sm">Recap completed</p>
              </>
            )}
          </div>
        }
        icon={<FileText className="h-5 w-5 text-gray-500" />}
      />
      <div className="md:col-span-2 lg:col-span-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">Quick Submit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Link href="/dashboard/new-request/petty-cash">
                <Button variant="outline" size="sm" className="h-9">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Petty Cash
                </Button>
              </Link>
              <Link href="/dashboard/new-request/requisition">
                <Button size="sm" className="h-9">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Requisition
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
      <DashboardCard
        title="My Disbursement Codes"
        description="Codes pending verification"
        content={
          loading ? (
            <div className="h-20 bg-muted animate-pulse rounded" />
          ) : dashboardData.openRequests > 0 ? (
            <div className="p-3 bg-muted rounded-md">
              <div className="font-mono text-center text-lg">123456</div>
              <p className="text-xs text-muted-foreground mt-2">
                Verification code for REQ-001. Share with disburser to confirm receipt.
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No pending disbursement codes</p>
          )
        }
        icon={<CreditCard className="h-5 w-5 text-green-500" />}
      />
    </div>
  )

  // Supervisor Dashboard
  const renderSupervisorDashboard = () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <DashboardCard
        title="Pending for My Authorization"
        description="Requests awaiting your approval"
        value={dashboardData.pendingApprovals.toString()}
        icon={<Clock className="h-5 w-5 text-amber-500" />}
        loading={loading}
        link="/dashboard/approvals"
        alert={dashboardData.pendingApprovals > 0}
      />
      <DashboardCard
        title="My Team Summary"
        description="Status of team requests"
        content={
          <div className="flex justify-between items-center">
            <div className="text-center">
              <div className="text-lg font-bold">{loading ? "-" : dashboardData.teamSummary.open}</div>
              <div className="text-xs text-muted-foreground">Open</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{loading ? "-" : dashboardData.teamSummary.approved}</div>
              <div className="text-xs text-muted-foreground">Approved</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{loading ? "-" : dashboardData.teamSummary.rejected}</div>
              <div className="text-xs text-muted-foreground">Rejected</div>
            </div>
          </div>
        }
        icon={<Users className="h-5 w-5 text-blue-500" />}
      />
      <DashboardCard
        title="Average Approval Time"
        description="Time to process requests"
        value={loading ? "-" : `${dashboardData.departmentKPIs.avgTurnaround} days`}
        icon={<Clock className="h-5 w-5 text-green-500" />}
        loading={loading}
      />
      <DashboardCard
        title="Escalations"
        description="Requests pending > 5 days"
        value="1"
        icon={<AlertCircle className="h-5 w-5 text-red-500" />}
        loading={loading}
        alert={true}
      />
      <DashboardCard
        title="Recent Delegations"
        description="Requests delegated to you"
        value="0"
        icon={<Users className="h-5 w-5 text-gray-500" />}
        loading={loading}
      />
    </div>
  )

  // Head of Department Dashboard
  const renderHeadOfDepartmentDashboard = () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <DashboardCard
        title="Dept. Pending Approvals"
        description={`Approvals for ${userDepartment}`}
        value={dashboardData.pendingApprovals.toString()}
        icon={<Clock className="h-5 w-5 text-amber-500" />}
        loading={loading}
        link="/dashboard/approvals"
        alert={dashboardData.pendingApprovals > 0}
      />
      <DashboardCard
        title="Dept. KPI Overview"
        description="Department performance"
        content={
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Total Requests:</span>
              <span className="font-medium">{loading ? "-" : dashboardData.departmentKPIs.totalRequests}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Approval Rate:</span>
              <span className="font-medium">{loading ? "-" : `${dashboardData.departmentKPIs.approvalRate}%`}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Avg. Turnaround:</span>
              <span className="font-medium">
                {loading ? "-" : `${dashboardData.departmentKPIs.avgTurnaround} days`}
              </span>
            </div>
          </div>
        }
        icon={<BarChart3 className="h-5 w-5 text-blue-500" />}
      />
      <DashboardCard
        title="Dept. Recap Status"
        description="Recap submission status"
        content={
          <div className="flex justify-between items-center">
            <div className="text-center">
              <div className="text-lg font-bold text-green-500">{loading ? "-" : "4"}</div>
              <div className="text-xs text-muted-foreground">On Time</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-amber-500">{loading ? "-" : "1"}</div>
              <div className="text-xs text-muted-foreground">Due Soon</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-500">{loading ? "-" : "2"}</div>
              <div className="text-xs text-muted-foreground">Overdue</div>
            </div>
          </div>
        }
        icon={<FileText className="h-5 w-5 text-green-500" />}
      />
      <DashboardCard
        title="Top Requesters"
        description="Most active users"
        content={
          <div className="space-y-2">
            {loading ? (
              Array(3)
                .fill(0)
                .map((_, i) => <div key={i} className="h-5 bg-muted animate-pulse rounded" />)
            ) : (
              <>
                <div className="flex justify-between">
                  <span className="text-sm">John Doe</span>
                  <span className="font-medium">7 requests</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Jane Smith</span>
                  <span className="font-medium">5 requests</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Robert Brown</span>
                  <span className="font-medium">3 requests</span>
                </div>
              </>
            )}
          </div>
        }
        icon={<Users className="h-5 w-5 text-blue-500" />}
      />
      <DashboardCard
        title="Alerts & Exceptions"
        description="Issues requiring attention"
        value="2"
        icon={<AlertCircle className="h-5 w-5 text-red-500" />}
        loading={loading}
        alert={true}
      />
    </div>
  )

  // Head of Admin & HR Dashboard
  const renderHeadAdminHRDashboard = () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <DashboardCard
        title="Pending Admin Approvals"
        description="Approvals requiring your attention"
        value={dashboardData.pendingAdminApprovals.toString()}
        icon={<Clock className="h-5 w-5 text-amber-500" />}
        loading={loading}
        link="/dashboard/approvals"
        alert={dashboardData.pendingAdminApprovals > 0}
      />
      <DashboardCard
        title="User Management"
        description="Quick links"
        content={
          <div className="flex flex-wrap gap-2">
            <Link href="/dashboard/users">
              <Button variant="outline" size="sm">
                <Users className="mr-2 h-4 w-4" />
                Manage Users
              </Button>
            </Link>
          </div>
        }
        icon={<Users className="h-5 w-5 text-blue-500" />}
      />
      <DashboardCard
        title="Role Assignment Summary"
        description="Users by role"
        content={
          <div className="space-y-2">
            {loading ? (
              Array(4)
                .fill(0)
                .map((_, i) => <div key={i} className="h-5 bg-muted animate-pulse rounded" />)
            ) : (
              <>
                <div className="flex justify-between">
                  <span className="text-sm">Users:</span>
                  <span className="font-medium">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Supervisors:</span>
                  <span className="font-medium">5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Department Heads:</span>
                  <span className="font-medium">3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Finance Roles:</span>
                  <span className="font-medium">4</span>
                </div>
              </>
            )}
          </div>
        }
        icon={<Users className="h-5 w-5 text-green-500" />}
      />
      <DashboardCard
        title="Audit Log Snapshot"
        description="Recent system activity"
        content={
          <div className="space-y-2">
            {loading ? (
              Array(3)
                .fill(0)
                .map((_, i) => <div key={i} className="h-5 bg-muted animate-pulse rounded" />)
            ) : (
              <>
                <p className="text-sm">User role updated</p>
                <p className="text-sm">New user created</p>
                <p className="text-sm">System settings changed</p>
              </>
            )}
          </div>
        }
        icon={<FileText className="h-5 w-5 text-blue-500" />}
        link="/admin/audit-logs"
      />
      <DashboardCard
        title="System Health"
        description="System status overview"
        content={
          <div className="space-y-2">
            {loading ? (
              Array(3)
                .fill(0)
                .map((_, i) => <div key={i} className="h-5 bg-muted animate-pulse rounded" />)
            ) : (
              <>
                <div className="flex justify-between">
                  <span className="text-sm">Uptime:</span>
                  <span className="font-medium text-green-500">99.9%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Error Rate:</span>
                  <span className="font-medium text-green-500">0.1%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">API Performance:</span>
                  <span className="font-medium text-green-500">120ms</span>
                </div>
              </>
            )}
          </div>
        }
        icon={<CheckCircle className="h-5 w-5 text-green-500" />}
        link="/admin/error-logs"
      />
    </div>
  )

  // GRC Manager Dashboard
  const renderGRCManagerDashboard = () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <DashboardCard
        title="Pending GRC Reviews"
        description="Reviews requiring your attention"
        value={dashboardData.pendingGRCReviews.toString()}
        icon={<Clock className="h-5 w-5 text-amber-500" />}
        loading={loading}
        link="/dashboard/approvals"
        alert={dashboardData.pendingGRCReviews > 0}
      />
      <DashboardCard
        title="Compliance Dashboard"
        description="Compliance metrics"
        content={
          <div className="space-y-2">
            {loading ? (
              Array(3)
                .fill(0)
                .map((_, i) => <div key={i} className="h-5 bg-muted animate-pulse rounded" />)
            ) : (
              <>
                <div className="flex justify-between">
                  <span className="text-sm">Missing Docs:</span>
                  <span className="font-medium text-amber-500">3%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Policy Adherence:</span>
                  <span className="font-medium text-green-500">97%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Approval Compliance:</span>
                  <span className="font-medium text-green-500">100%</span>
                </div>
              </>
            )}
          </div>
        }
        icon={<CheckCircle className="h-5 w-5 text-green-500" />}
      />
      <DashboardCard
        title="Audit Trail Highlights"
        description="Recent high-risk actions"
        content={
          <div className="space-y-2">
            {loading ? (
              Array(3)
                .fill(0)
                .map((_, i) => <div key={i} className="h-5 bg-muted animate-pulse rounded" />)
            ) : (
              <>
                <p className="text-sm">Large requisition approved</p>
                <p className="text-sm">Multiple recaps overdue</p>
                <p className="text-sm">System setting changed</p>
              </>
            )}
          </div>
        }
        icon={<FileText className="h-5 w-5 text-blue-500" />}
        link="/admin/audit-logs"
      />
      <DashboardCard
        title="Error Log Alerts"
        description="Critical system errors"
        value="0"
        icon={<AlertCircle className="h-5 w-5 text-green-500" />}
        loading={loading}
        link="/admin/error-logs"
      />
      <DashboardCard
        title="Policy Exceptions"
        description="Requests flagged for policy breaches"
        value="2"
        icon={<AlertCircle className="h-5 w-5 text-red-500" />}
        loading={loading}
        alert={true}
      />
    </div>
  )

  // Accounts Officer Dashboard
  const renderAccountsOfficerDashboard = () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <DashboardCard
        title="Recaps Pending Check"
        description="Recaps requiring your verification"
        value={dashboardData.recapsPendingCheck.toString()}
        icon={<Clock className="h-5 w-5 text-amber-500" />}
        loading={loading}
        link="/dashboard/recaps"
        alert={dashboardData.recapsPendingCheck > 0}
      />
      <DashboardCard
        title="Recap Overdue Alerts"
        description="Recaps past due date"
        value="3"
        icon={<AlertCircle className="h-5 w-5 text-red-500" />}
        loading={loading}
        alert={true}
      />
      <DashboardCard
        title="Auto-Calc Summary"
        description="Refund vs. reimbursement breakdown"
        content={
          <div className="space-y-2">
            {loading ? (
              Array(2)
                .fill(0)
                .map((_, i) => <div key={i} className="h-5 bg-muted animate-pulse rounded" />)
            ) : (
              <>
                <div className="flex justify-between">
                  <span className="text-sm">Refunds to Requesters:</span>
                  <span className="font-medium">{formatCurrency(1250)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Reimbursements to Org:</span>
                  <span className="font-medium">{formatCurrency(750)}</span>
                </div>
              </>
            )}
          </div>
        }
        icon={<BarChart3 className="h-5 w-5 text-blue-500" />}
      />
      <DashboardCard
        title="Disbursement Codes Issued"
        description="Codes generated this month"
        value="12"
        icon={<CreditCard className="h-5 w-5 text-green-500" />}
        loading={loading}
      />
      <DashboardCard
        title="Recent Disbursement Verifications"
        description="Recently verified disbursements"
        content={
          <div className="space-y-2">
            {loading ? (
              Array(3)
                .fill(0)
                .map((_, i) => <div key={i} className="h-5 bg-muted animate-pulse rounded" />)
            ) : (
              <>
                <p className="text-sm">REQ-004 verified by John Doe</p>
                <p className="text-sm">REQ-002 verified by Jane Smith</p>
                <p className="text-sm">REQ-001 verified by Robert Brown</p>
              </>
            )}
          </div>
        }
        icon={<CheckCircle className="h-5 w-5 text-green-500" />}
      />
    </div>
  )

  // Head of Finance Dashboard
  const renderHeadFinanceDashboard = () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <DashboardCard
        title="Pending Finance Approvals"
        description="Approvals requiring your attention"
        value={dashboardData.pendingFinanceApprovals.toString()}
        icon={<Clock className="h-5 w-5 text-amber-500" />}
        loading={loading}
        link="/dashboard/approvals"
        alert={dashboardData.pendingFinanceApprovals > 0}
      />
      <DashboardCard
        title="Monthly Spend Overview"
        description="Spending by request type"
        content={
          <div className="space-y-2">
            {loading ? (
              Array(3)
                .fill(0)
                .map((_, i) => <div key={i} className="h-5 bg-muted animate-pulse rounded" />)
            ) : (
              <>
                <div className="flex justify-between">
                  <span className="text-sm">Petty Cash:</span>
                  <span className="font-medium">{formatCurrency(2500)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Requisitions:</span>
                  <span className="font-medium">{formatCurrency(15750)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Total:</span>
                  <span className="font-medium">{formatCurrency(18250)}</span>
                </div>
              </>
            )}
          </div>
        }
        icon={<BarChart3 className="h-5 w-5 text-blue-500" />}
      />
      <DashboardCard
        title="Budget vs. Actual"
        description="Monthly comparison"
        content={
          <div className="space-y-2">
            {loading ? (
              Array(3)
                .fill(0)
                .map((_, i) => <div key={i} className="h-5 bg-muted animate-pulse rounded" />)
            ) : (
              <>
                <div className="flex justify-between">
                  <span className="text-sm">Budget:</span>
                  <span className="font-medium">{formatCurrency(25000)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Actual:</span>
                  <span className="font-medium">{formatCurrency(18250)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Variance:</span>
                  <span className="font-medium text-green-500">-27%</span>
                </div>
              </>
            )}
          </div>
        }
        icon={<BarChart3 className="h-5 w-5 text-green-500" />}
      />
      <DashboardCard
        title="Auto-Approval Toggle"
        description="Control automatic approvals"
        content={
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Auto-Approval Enabled</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                toast({
                  title: "Auto-Approval Updated",
                  description: "Auto-approval setting has been toggled.",
                })
              }}
            >
              {loading ? "Loading..." : "Toggle"}
            </Button>
          </div>
        }
        icon={<CheckCircle className="h-5 w-5 text-blue-500" />}
      />
      <DashboardCard
        title="Printable Reports"
        description="Generate financial reports"
        content={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                toast({
                  title: "Report Generated",
                  description: "Monthly financial report has been generated.",
                })
              }}
            >
              Monthly Report
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                toast({
                  title: "Report Generated",
                  description: "Department summary report has been generated.",
                })
              }}
            >
              Dept. Summary
            </Button>
          </div>
        }
        icon={<FileText className="h-5 w-5 text-blue-500" />}
      />
    </div>
  )

  // Finance User Group Dashboard
  const renderFinanceUserGroupDashboard = () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <DashboardCard
        title="My Assigned Tasks"
        description="Tasks requiring your attention"
        value="5"
        icon={<Clock className="h-5 w-5 text-amber-500" />}
        loading={loading}
        link="/dashboard/approvals"
        alert={true}
      />
      <DashboardCard
        title="Finance Metrics Snapshot"
        description="Key financial indicators"
        content={
          <div className="space-y-2">
            {loading ? (
              Array(3)
                .fill(0)
                .map((_, i) => <div key={i} className="h-5 bg-muted animate-pulse rounded" />)
            ) : (
              <>
                <div className="flex justify-between">
                  <span className="text-sm">Monthly Spend:</span>
                  <span className="font-medium">{formatCurrency(18250)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Approval Rate:</span>
                  <span className="font-medium">92%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Avg. Processing Time:</span>
                  <span className="font-medium">1.8 days</span>
                </div>
              </>
            )}
          </div>
        }
        icon={<BarChart3 className="h-5 w-5 text-blue-500" />}
      />
      <DashboardCard
        title="Disbursement Status"
        description="Status of disbursements"
        content={
          <div className="flex justify-between items-center">
            <div className="text-center">
              <div className="text-lg font-bold">{loading ? "-" : "8"}</div>
              <div className="text-xs text-muted-foreground">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{loading ? "-" : "12"}</div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{loading ? "-" : "3"}</div>
              <div className="text-xs text-muted-foreground">Verified</div>
            </div>
          </div>
        }
        icon={<CreditCard className="h-5 w-5 text-green-500" />}
      />
      <DashboardCard
        title="Alerts"
        description="Issues requiring attention"
        value="2"
        icon={<AlertCircle className="h-5 w-5 text-red-500" />}
        loading={loading}
        alert={true}
      />
    </div>
  )

  // Disburser Dashboard
  const renderDisburserDashboard = () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <DashboardCard
        title="Requests Awaiting Disbursement"
        description="Ready for processing"
        value={dashboardData.requestsAwaitingDisbursement.toString()}
        icon={<Clock className="h-5 w-5 text-amber-500" />}
        loading={loading}
        link="/dashboard/disbursements"
        alert={dashboardData.requestsAwaitingDisbursement > 0}
      />
      <DashboardCard
        title="Generate Verification Code"
        description="For selected request"
        content={
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                toast({
                  title: "Code Generated",
                  description: "Verification code has been generated and sent.",
                })
              }}
            >
              Generate New Code
            </Button>
            <p className="text-xs text-muted-foreground">
              Generate a verification code for a disbursement that requires confirmation.
            </p>
          </div>
        }
        icon={<CreditCard className="h-5 w-5 text-blue-500" />}
      />
      <DashboardCard
        title="Recent Codes Issued"
        description="Last 3 verification codes"
        content={
          <div className="space-y-2">
            {loading ? (
              Array(3)
                .fill(0)
                .map((_, i) => <div key={i} className="h-5 bg-muted animate-pulse rounded" />)
            ) : (
              <>
                <div className="flex justify-between">
                  <span className="text-sm">REQ-004:</span>
                  <span className="font-mono">123456</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">REQ-003:</span>
                  <span className="font-mono">789012</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">REQ-002:</span>
                  <span className="font-mono">345678</span>
                </div>
              </>
            )}
          </div>
        }
        icon={<FileText className="h-5 w-5 text-blue-500" />}
      />
      <DashboardCard
        title="Code Verification Log"
        description="Who redeemed, when"
        content={
          <div className="space-y-2">
            {loading ? (
              Array(3)
                .fill(0)
                .map((_, i) => <div key={i} className="h-5 bg-muted animate-pulse rounded" />)
            ) : (
              <>
                <p className="text-sm">REQ-002: Jane Smith (2 days ago)</p>
                <p className="text-sm">REQ-001: John Doe (5 days ago)</p>
                <p className="text-sm">REQ-005: Robert Brown (7 days ago)</p>
              </>
            )}
          </div>
        }
        icon={<CheckCircle className="h-5 w-5 text-green-500" />}
      />
    </div>
  )

  // Admin Dashboard (combines multiple views)
  const renderAdminDashboard = () => (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="System Overview"
          description="System status"
          content={
            <div className="space-y-2">
              {loading ? (
                Array(3)
                  .fill(0)
                  .map((_, i) => <div key={i} className="h-5 bg-muted animate-pulse rounded" />)
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-sm">Uptime:</span>
                    <span className="font-medium text-green-500">99.9%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Active Users:</span>
                    <span className="font-medium">24</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Total Requests:</span>
                    <span className="font-medium">156</span>
                  </div>
                </>
              )}
            </div>
          }
          icon={<CheckCircle className="h-5 w-5 text-green-500" />}
        />
        <DashboardCard
          title="User Management"
          description="Quick links"
          content={
            <div className="flex flex-wrap gap-2">
              <Link href="/dashboard/users">
                <Button variant="outline" size="sm">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Users
                </Button>
              </Link>
              <Link href="/admin">
                <Button variant="outline" size="sm">
                  <Users className="mr-2 h-4 w-4" />
                  Admin Panel
                </Button>
              </Link>
            </div>
          }
          icon={<Users className="h-5 w-5 text-blue-500" />}
        />
        <DashboardCard
          title="Error Logs"
          description="System errors"
          value="0"
          icon={<AlertCircle className="h-5 w-5 text-green-500" />}
          loading={loading}
          link="/admin/error-logs"
        />
        <DashboardCard
          title="Audit Logs"
          description="Recent system activity"
          content={
            <div className="space-y-2">
              {loading ? (
                Array(2)
                  .fill(0)
                  .map((_, i) => <div key={i} className="h-5 bg-muted animate-pulse rounded" />)
              ) : (
                <>
                  <p className="text-sm">User role updated</p>
                  <p className="text-sm">System setting changed</p>
                </>
              )}
            </div>
          }
          icon={<FileText className="h-5 w-5 text-blue-500" />}
          link="/admin/audit-logs"
        />
      </div>

      <h2 className="text-xl font-semibold mt-6">Request Management</h2>
      {renderUserDashboard()}
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Welcome, {userName}</h2>
        <div className="text-sm text-muted-foreground">
          Role: <span className="font-medium">{userRole}</span> | Department:{" "}
          <span className="font-medium">{userDepartment}</span>
        </div>
      </div>
      {renderDashboard()}
    </div>
  )
}

// Dashboard Card Component
interface DashboardCardProps {
  title: string
  description: string
  value?: string
  content?: React.ReactNode
  icon: React.ReactNode
  loading?: boolean
  link?: string
  alert?: boolean
}

function DashboardCard({
  title,
  description,
  value,
  content,
  icon,
  loading = false,
  link,
  alert = false,
}: DashboardCardProps) {
  return (
    <Card className={alert ? "border-amber-200 dark:border-amber-800" : ""}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <CardDescription className="text-xs">{description}</CardDescription>
        {value ? (
          <div className="mt-2 text-2xl font-bold">
            {loading ? <div className="h-8 w-16 animate-pulse rounded bg-muted"></div> : value}
          </div>
        ) : (
          <div className="mt-2">{content}</div>
        )}
        {link && (
          <div className="mt-4">
            <Link href={link} className="text-xs text-blue-500 hover:underline">
              View details →
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
