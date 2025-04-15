import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import {
  getAllErrorLogs,
  getErrorLogsByType,
  getErrorLogsByUserId,
  getErrorLogsByDateRange,
  getRecentErrorLogs,
} from "@/lib/db/error-logs"

// GET /api/logs/error - Get error logs with optional filters
export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only Admin can access error logs
    if (session.user.role !== "Admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const url = new URL(req.url)
    const errorType = url.searchParams.get("errorType")
    const userId = url.searchParams.get("userId")
    const startDate = url.searchParams.get("startDate")
    const endDate = url.searchParams.get("endDate")
    const limit = url.searchParams.get("limit")

    let logs

    if (errorType) {
      logs = await getErrorLogsByType(errorType)
    } else if (userId) {
      logs = await getErrorLogsByUserId(userId)
    } else if (startDate && endDate) {
      logs = await getErrorLogsByDateRange(new Date(startDate), new Date(endDate))
    } else if (limit) {
      logs = await getRecentErrorLogs(Number.parseInt(limit))
    } else {
      logs = await getAllErrorLogs()
    }

    // Format the logs for the frontend
    const formattedLogs = logs.map((log) => ({
      id: log._id?.toString() || log.error_id,
      timestamp: log.timestamp.toISOString(),
      errorType: log.error_type,
      message: log.message,
      stackTrace: log.stack_trace,
      userId: log.user_id?.toString(),
      userName: log.user_id ? "User" : "System", // This would need to be fetched from user data
      requestInfo: log.request_info,
      severity: log.error_type.includes("Critical")
        ? "critical"
        : log.error_type.includes("Warning")
          ? "warning"
          : "info",
    }))

    return NextResponse.json(formattedLogs)
  } catch (error: any) {
    console.error("Error fetching error logs:", error)

    // Create a new error log for this error (but be careful not to create an infinite loop)
    try {
      const errorLog = {
        timestamp: new Date(),
        error_type: "API Error",
        message: `Error fetching error logs: ${error.message}`,
        stack_trace: error.stack,
        request_info: {
          method: "GET",
          url: "/api/logs/error",
        },
      }

      // Log to console since we can't safely call createErrorLog here
      console.error("Meta-error:", errorLog)
    } catch (metaError) {
      console.error("Failed to log error about error logging:", metaError)
    }

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
