import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import {
  getAllAuditLogs,
  getAuditLogsByUserId,
  getAuditLogsByActionType,
  getAuditLogsByTargetId,
  getAuditLogsByDateRange,
  getRecentAuditLogs,
} from "@/lib/db/audit-logs"
import { createErrorLog } from "@/lib/db/error-logs"

// GET /api/logs/audit - Get audit logs with optional filters
export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only Admin can access audit logs
    if (session.user.role !== "Admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const url = new URL(req.url)
    const userId = url.searchParams.get("userId")
    const actionType = url.searchParams.get("actionType")
    const targetId = url.searchParams.get("targetId")
    const startDate = url.searchParams.get("startDate")
    const endDate = url.searchParams.get("endDate")
    const limit = url.searchParams.get("limit")

    let logs

    if (userId) {
      logs = await getAuditLogsByUserId(userId)
    } else if (actionType) {
      logs = await getAuditLogsByActionType(actionType)
    } else if (targetId) {
      logs = await getAuditLogsByTargetId(targetId)
    } else if (startDate && endDate) {
      logs = await getAuditLogsByDateRange(new Date(startDate), new Date(endDate))
    } else if (limit) {
      logs = await getRecentAuditLogs(Number.parseInt(limit))
    } else {
      logs = await getAllAuditLogs()
    }

    // Format the logs for the frontend
    const formattedLogs = logs.map((log) => ({
      id: log._id?.toString() || log.log_id,
      timestamp: log.timestamp.toISOString(),
      user: {
        id: log.user_id?.toString() || "",
        name: log.user_details?.name || "Unknown",
        email: log.user_details?.badge_number || "",
        role: log.user_details?.role || "",
      },
      actionType: log.action_type,
      description: log.description,
      targetType: log.target_type || "",
      targetId: log.target_id || "",
      ipAddress: log.ip_address || "",
    }))

    return NextResponse.json(formattedLogs)
  } catch (error: any) {
    console.error("Error fetching audit logs:", error)

    // Log error
    await createErrorLog({
      timestamp: new Date(),
      error_type: "API Error",
      message: `Error fetching audit logs: ${error.message}`,
      stack_trace: error.stack,
      request_info: {
        method: "GET",
        url: "/api/logs/audit",
      },
    })

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
