import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { getRequestById, getRequestByRequestId, updateRequest, deleteRequest } from "@/lib/db/requests"
import { createAuditLog } from "@/lib/db/audit-logs"
import { createErrorLog } from "@/lib/db/error-logs"
import { ObjectId } from "mongodb"
import { isValidObjectId } from "@/lib/utils"

// GET /api/requests/[id] - Get request by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let request

    // Check if the ID is a valid ObjectId or a request ID (like REQ-XXX)
    if (isValidObjectId(params.id)) {
      // If it's a valid ObjectId, fetch by _id
      request = await getRequestById(params.id)
    } else {
      // Otherwise, try to fetch by request_id
      request = await getRequestByRequestId(params.id)
    }

    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 })
    }

    // Check authorization based on role
    if (
      session.user.role !== "Admin" &&
      session.user.role !== "Finance User Group" &&
      session.user.department !== request.department &&
      session.user.id !== request.user_id.toString()
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json(request)
  } catch (error: any) {
    console.error(`Error fetching request ${params.id}:`, error)

    // Log error
    await createErrorLog({
      timestamp: new Date(),
      error_type: "API Error",
      message: `Error fetching request: ${error.message}`,
      stack_trace: error.stack,
      request_info: {
        method: "GET",
        url: `/api/requests/${params.id}`,
      },
    })

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// PUT /api/requests/[id] - Update request
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const request = await getRequestById(params.id)

    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 })
    }

    // Only the request creator or an admin can update the request
    if (session.user.id !== request.user_id.toString() && session.user.role !== "Admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Can only update if the request is still pending
    if (request.status !== "pending") {
      return NextResponse.json(
        {
          error: "Cannot update a request that has already been processed",
        },
        { status: 400 },
      )
    }

    const requestData = await req.json()
    const success = await updateRequest(params.id, requestData)

    if (!success) {
      return NextResponse.json({ error: "Request not found or no changes made" }, { status: 404 })
    }

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
      description: `Updated request: ${params.id}`,
      target_id: params.id,
      target_type: "request",
      ip_address: req.headers.get("x-forwarded-for") || undefined,
    })

    const updatedRequest = await getRequestById(params.id)
    return NextResponse.json(updatedRequest)
  } catch (error: any) {
    console.error(`Error updating request ${params.id}:`, error)

    // Log error
    await createErrorLog({
      timestamp: new Date(),
      error_type: "API Error",
      message: `Error updating request: ${error.message}`,
      stack_trace: error.stack,
      request_info: {
        method: "PUT",
        url: `/api/requests/${params.id}`,
      },
    })

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// DELETE /api/requests/[id] - Delete request
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const request = await getRequestById(params.id)

    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 })
    }

    // Only the request creator or an admin can delete the request
    if (session.user.id !== request.user_id.toString() && session.user.role !== "Admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Can only delete if the request is still pending
    if (request.status !== "pending") {
      return NextResponse.json(
        {
          error: "Cannot delete a request that has already been processed",
        },
        { status: 400 },
      )
    }

    const success = await deleteRequest(params.id)

    if (!success) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 })
    }

    // Log the action
    await createAuditLog({
      user_id: new ObjectId(session.user.id),
      user_details: {
        name: session.user.name,
        badge_number: session.user.badge_number,
        role: session.user.role,
      },
      action_type: "delete",
      timestamp: new Date(),
      description: `Deleted request: ${params.id}`,
      target_id: params.id,
      target_type: "request",
      ip_address: req.headers.get("x-forwarded-for") || undefined,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error(`Error deleting request ${params.id}:`, error)

    // Log error
    await createErrorLog({
      timestamp: new Date(),
      error_type: "API Error",
      message: `Error deleting request: ${error.message}`,
      stack_trace: error.stack,
      request_info: {
        method: "DELETE",
        url: `/api/requests/${params.id}`,
      },
    })

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
