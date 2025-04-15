import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { getRecentAuditLogs } from "@/lib/db/audit-logs"
import { createErrorLog } from "@/lib/db/error-logs"

// GET /api/admin/activity - Get recent admin activity
export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only Admin can access admin activity
    if (session.user.role !== "Admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const url = new URL(req.url)
    const limit = Number.parseInt(url.searchParams.get("limit") || "10")

    // Get recent audit logs
    const logs = await getRecentAuditLogs(limit)

    // Format the logs for the frontend
    const formattedLogs = logs.map((log) => ({
      id: log._id?.toString() || log.log_id,
      user: {
        name: log.user_details.name,
        email: log.user_details.badge_number,
      },
      action: log.action_type,
      target: log.description,
      timestamp: log.timestamp.toISOString(),
    }))

    return NextResponse.json(formattedLogs)
  } catch (error: any) {
    console.error("Error fetching admin activity:", error)

    // Log error
    await createErrorLog({
      timestamp: new Date(),
      error_type: "API Error",
      message: `Error fetching admin activity: ${error.message}`,
      stack_trace: error.stack,
      request_info: {
        method: "GET",
        url: "/api/admin/activity",
      },
    })

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
