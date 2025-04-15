import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { migrateExternalIds } from "@/lib/db/init-db"
import { createErrorLog } from "@/lib/db/error-logs"
import { createAuditLog } from "@/lib/db/audit-logs"
import { ObjectId } from "mongodb"

// POST /api/admin/migrate-users - Migrate users from externalId to external_accounts
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only Admin can migrate users
    if (session.user.role !== "Admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Run migration
    const result = await migrateExternalIds()

    // Log the action
    await createAuditLog({
      user_id: new ObjectId(session.user.id),
      user_details: {
        name: session.user.name,
        badge_number: session.user.badge_number,
        role: session.user.role,
      },
      action_type: "update",
      timestamp: new Date(),
      description: `Migrated users from externalId to external_accounts: ${result.migrated} migrated, ${result.errors} errors`,
      target_type: "system",
      ip_address: req.headers.get("x-forwarded-for") || undefined,
    })

    return NextResponse.json({
      success: true,
      message: "User migration completed successfully",
      result,
    })
  } catch (error: any) {
    console.error("Error migrating users:", error)

    // Log error
    await createErrorLog({
      timestamp: new Date(),
      error_type: "API Error",
      message: `Error migrating users: ${error.message}`,
      stack_trace: error.stack,
      request_info: {
        method: "POST",
        url: "/api/admin/migrate-users",
      },
    })

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
