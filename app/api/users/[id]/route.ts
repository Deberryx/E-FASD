import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { getUserById, updateUser, deleteUser, updateUserStatus } from "@/lib/db/users"
import { createAuditLog } from "@/lib/db/audit-logs"
import { createErrorLog } from "@/lib/db/error-logs"

// GET /api/users/[id] - Get user by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Users can only access their own data unless they are Admin or Finance
    if (session.user.id !== params.id && session.user.role !== "Admin" && session.user.role !== "Finance User Group") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const user = await getUserById(params.id)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error: any) {
    console.error(`Error fetching user ${params.id}:`, error)

    // Log error
    await createErrorLog({
      timestamp: new Date(),
      error_type: "API Error",
      message: `Error fetching user: ${error.message}`,
      stack_trace: error.stack,
      request_info: {
        method: "GET",
        url: `/api/users/${params.id}`,
      },
    })

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// PUT /api/users/[id] - Update user
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only Admin can update users
    if (session.user.role !== "Admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const userData = await req.json()

    try {
      const success = await updateUser(params.id, userData)

      if (!success) {
        return NextResponse.json({ error: "User not found or no changes made" }, { status: 404 })
      }

      // Log the action
      await createAuditLog({
        user_id: session.user.id,
        user_details: {
          name: session.user.name,
          badge_number: session.user.badge_number,
          role: session.user.role,
        },
        action_type: "update",
        timestamp: new Date(),
        description: `Updated user: ${params.id}`,
        target_id: params.id,
        target_type: "user",
        ip_address: req.headers.get("x-forwarded-for") || undefined,
      })

      const updatedUser = await getUserById(params.id)
      return NextResponse.json(updatedUser)
    } catch (error: any) {
      if (error.message.includes("already exists")) {
        return NextResponse.json({ error: error.message }, { status: 409 })
      }
      throw error
    }
  } catch (error: any) {
    console.error(`Error updating user ${params.id}:`, error)

    // Log error
    await createErrorLog({
      timestamp: new Date(),
      error_type: "API Error",
      message: `Error updating user: ${error.message}`,
      stack_trace: error.stack,
      request_info: {
        method: "PUT",
        url: `/api/users/${params.id}`,
      },
    })

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// DELETE /api/users/[id] - Delete user
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only Admin can delete users
    if (session.user.role !== "Admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const success = await deleteUser(params.id)

    if (!success) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Log the action
    await createAuditLog({
      user_id: session.user.id,
      user_details: {
        name: session.user.name,
        badge_number: session.user.badge_number,
        role: session.user.role,
      },
      action_type: "delete",
      timestamp: new Date(),
      description: `Deleted user: ${params.id}`,
      target_id: params.id,
      target_type: "user",
      ip_address: req.headers.get("x-forwarded-for") || undefined,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error(`Error deleting user ${params.id}:`, error)

    // Log error
    await createErrorLog({
      timestamp: new Date(),
      error_type: "API Error",
      message: `Error deleting user: ${error.message}`,
      stack_trace: error.stack,
      request_info: {
        method: "DELETE",
        url: `/api/users/${params.id}`,
      },
    })

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// PATCH /api/users/[id]/status - Update user status (lock/unlock)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only Admin can update user status
    if (session.user.role !== "Admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { status } = await req.json()

    if (status !== "active" && status !== "locked") {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const success = await updateUserStatus(params.id, status)

    if (!success) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Log the action
    await createAuditLog({
      user_id: session.user.id,
      user_details: {
        name: session.user.name,
        badge_number: session.user.badge_number,
        role: session.user.role,
      },
      action_type: "update",
      timestamp: new Date(),
      description: `Updated user status to ${status}: ${params.id}`,
      target_id: params.id,
      target_type: "user",
      ip_address: req.headers.get("x-forwarded-for") || undefined,
    })

    return NextResponse.json({ success: true, status })
  } catch (error: any) {
    console.error(`Error updating user status ${params.id}:`, error)

    // Log error
    await createErrorLog({
      timestamp: new Date(),
      error_type: "API Error",
      message: `Error updating user status: ${error.message}`,
      stack_trace: error.stack,
      request_info: {
        method: "PATCH",
        url: `/api/users/${params.id}/status`,
      },
    })

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
