import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { getRequestsByDateRange } from "@/lib/db/requests"
import { createErrorLog } from "@/lib/db/error-logs"

// GET /api/reports - Generate reports
export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only Admin and Finance can access reports
    if (session.user.role !== "Admin" && session.user.role !== "Finance User Group") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const url = new URL(req.url)
    const startDate = url.searchParams.get("startDate")
    const endDate = url.searchParams.get("endDate")
    const department = url.searchParams.get("department")
    const type = url.searchParams.get("type")
    const status = url.searchParams.get("status")

    if (!startDate || !endDate) {
      return NextResponse.json({ error: "Start date and end date are required" }, { status: 400 })
    }

    // Get requests for the date range
    const requests = await getRequestsByDateRange(new Date(startDate), new Date(endDate))

    // Apply additional filters
    let filteredRequests = requests

    if (department) {
      filteredRequests = filteredRequests.filter((req) => req.department === department)
    }

    if (type) {
      filteredRequests = filteredRequests.filter((req) => req.type_of_request === type)
    }

    if (status) {
      filteredRequests = filteredRequests.filter((req) => req.status === status)
    }

    // Calculate summary statistics
    const totalRequests = filteredRequests.length
    const totalAmount = filteredRequests.reduce((sum, req) => sum + req.amount, 0)
    const approvedAmount = filteredRequests
      .filter((req) => req.status === "approved" || req.status === "recap_needed")
      .reduce((sum, req) => sum + req.amount, 0)

    // Generate report data
    const report = {
      summary: {
        totalRequests,
        totalAmount,
        approvedAmount,
        startDate,
        endDate,
        department,
        type,
        status,
      },
      requests: filteredRequests,
      // Group by department
      byDepartment: Object.entries(
        filteredRequests.reduce((acc, req) => {
          acc[req.department] = acc[req.department] || { count: 0, amount: 0 }
          acc[req.department].count += 1
          acc[req.department].amount += req.amount
          return acc
        }, {}),
      ).map(([department, data]) => ({ department, ...data })),
      // Group by type
      byType: Object.entries(
        filteredRequests.reduce((acc, req) => {
          acc[req.type_of_request] = acc[req.type_of_request] || { count: 0, amount: 0 }
          acc[req.type_of_request].count += 1
          acc[req.type_of_request].amount += req.amount
          return acc
        }, {}),
      ).map(([type, data]) => ({ type, ...data })),
      // Group by status
      byStatus: Object.entries(
        filteredRequests.reduce((acc, req) => {
          acc[req.status] = acc[req.status] || { count: 0, amount: 0 }
          acc[req.status].count += 1
          acc[req.status].amount += req.amount
          return acc
        }, {}),
      ).map(([status, data]) => ({ status, ...data })),
    }

    return NextResponse.json(report)
  } catch (error: any) {
    console.error("Error generating report:", error)

    // Log error
    await createErrorLog({
      timestamp: new Date(),
      error_type: "API Error",
      message: `Error generating report: ${error.message}`,
      stack_trace: error.stack,
      request_info: {
        method: "GET",
        url: "/api/reports",
      },
    })

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
