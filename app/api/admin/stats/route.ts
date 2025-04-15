import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/mongodb"
import { createErrorLog } from "@/lib/db/error-logs"

// GET /api/admin/stats - Get admin dashboard statistics
export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only Admin can access admin stats
    if (session.user.role !== "Admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB)

    // Get total users count
    const totalUsers = await db.collection("users").countDocuments()

    // Get total departments count (assuming departments are stored in a collection)
    const totalDepartments = await db.collection("departments").countDocuments()

    // Get pending approvals count
    const pendingApprovals = await db.collection("requests").countDocuments({ status: "pending" })

    // Get system errors in the last 24 hours
    const oneDayAgo = new Date()
    oneDayAgo.setDate(oneDayAgo.getDate() - 1)
    const systemErrors = await db.collection("error_logs").countDocuments({
      timestamp: { $gte: oneDayAgo },
    })

    return NextResponse.json({
      totalUsers,
      totalDepartments,
      pendingApprovals,
      systemErrors,
    })
  } catch (error: any) {
    console.error("Error fetching admin stats:", error)

    // Log error
    await createErrorLog({
      timestamp: new Date(),
      error_type: "API Error",
      message: `Error fetching admin stats: ${error.message}`,
      stack_trace: error.stack,
      request_info: {
        method: "GET",
        url: "/api/admin/stats",
      },
    })

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
