import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/mongodb"
import { createErrorLog } from "@/lib/db/error-logs"

// GET /api/admin/system-status - Get system status
export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only Admin can access system status
    if (session.user.role !== "Admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Check MongoDB connection
    let databaseStatus: "online" | "degraded" | "offline" = "offline"
    try {
      const client = await clientPromise
      await client.db().admin().ping()
      databaseStatus = "online"
    } catch (error) {
      console.error("MongoDB connection error:", error)
      databaseStatus = "offline"
    }

    // For other services, we would implement actual health checks
    // For now, we'll return mock data

    return NextResponse.json({
      databaseStatus,
      azureAdStatus: "online",
      azureStorageStatus: "online",
      emailServiceStatus: "online",
      apiPerformance: {
        responseTime: 120, // ms
        errorRate: 0.2, // %
        requestsPerMinute: 42,
      },
      lastUpdated: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("Error fetching system status:", error)

    // Log error
    await createErrorLog({
      timestamp: new Date(),
      error_type: "API Error",
      message: `Error fetching system status: ${error.message}`,
      stack_trace: error.stack,
      request_info: {
        method: "GET",
        url: "/api/admin/system-status",
      },
    })

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
