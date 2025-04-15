import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { getAllUsers, createUser } from "@/lib/db/users"
import { createAuditLog } from "@/lib/db/audit-logs"
import { createErrorLog } from "@/lib/db/error-logs"

// GET /api/users - Get all users
export async function GET(req: NextRequest) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only Admin and Finance User Group can access all users
    if (session.user.role !== "Admin" && session.user.role !== "Finance User Group") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const users = await getAllUsers()
    return NextResponse.json(users)
  } catch (error: any) {
    console.error("Error fetching users:", error)

    // Log error
    await createErrorLog({
      timestamp: new Date(),
      error_type: "API Error",
      message: `Error fetching users: ${error.message}`,
      stack_trace: error.stack,
      request_info: {
        method: "GET",
        url: "/api/users",
      },
    })

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// Update the POST handler to properly create users
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only Admin can create users
    if (session.user.role !== "Admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const userData = await req.json()

    // Validate required fields
    if (!userData.name || !userData.email || !userData.badge_number || !userData.department || !userData.role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    try {
      const newUser = await createUser({
        name: userData.name,
        email: userData.email,
        badge_number: userData.badge_number,
        department: userData.department,
        role: userData.role,
        group_membership: userData.group_membership,
        status: userData.status || "active",
      })

      // Log the action
      await createAuditLog({
        user_id: session.user.id,
        user_details: {
          name: session.user.name,
          badge_number: session.user.badge_number,
          role: session.user.role,
        },
        action_type: "create",
        timestamp: new Date(),
        description: `Created new user: ${userData.name} (${userData.email})`,
        target_id: newUser._id?.toString(),
        target_type: "user",
        ip_address: req.headers.get("x-forwarded-for") || undefined,
      })

      return NextResponse.json(newUser, { status: 201 })
    } catch (error: any) {
      if (error.message.includes("already exists")) {
        return NextResponse.json({ error: error.message }, { status: 409 })
      }
      throw error
    }
  } catch (error: any) {
    console.error("Error creating user:", error)

    // Log error
    await createErrorLog({
      timestamp: new Date(),
      error_type: "API Error",
      message: `Error creating user: ${error.message}`,
      stack_trace: error.stack,
      request_info: {
        method: "POST",
        url: "/api/users",
      },
    })

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
