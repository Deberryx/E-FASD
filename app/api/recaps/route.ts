import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { getAllRecaps, createRecap, getRecapsByRequestId, getRecapsByUserId } from "@/lib/db/recaps"
import { getRequestById, updateRequestStatus } from "@/lib/db/requests"
import { createAuditLog } from "@/lib/db/audit-logs"
import { createErrorLog } from "@/lib/db/error-logs"
import { sendRecapSubmissionNotification } from "@/lib/notification"
import { ObjectId } from "mongodb"

// GET /api/recaps - Get recaps with optional filters
export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(req.url)
    const requestId = url.searchParams.get("requestId")
    const userId = url.searchParams.get("userId")

    let recaps

    if (requestId) {
      recaps = await getRecapsByRequestId(requestId)
    } else if (userId) {
      // Users can only see their own recaps unless they are Admin or Finance
      if (userId !== session.user.id && session.user.role !== "Admin" && session.user.role !== "Finance User Group") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
      recaps = await getRecapsByUserId(userId)
    } else {
      // Only Admin and Finance can see all recaps
      if (session.user.role !== "Admin" && session.user.role !== "Finance User Group") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
      recaps = await getAllRecaps()
    }

    return NextResponse.json(recaps)
  } catch (error: any) {
    console.error("Error fetching recaps:", error)

    // Log error
    await createErrorLog({
      timestamp: new Date(),
      error_type: "API Error",
      message: `Error fetching recaps: ${error.message}`,
      stack_trace: error.stack,
      request_info: {
        method: "GET",
        url: "/api/recaps",
      },
    })

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// POST /api/recaps - Create a new recap
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const recapData = await req.json()

    // Validate required fields
    if (!recapData.request_id || !recapData.actual_amount || !recapData.notes) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get the request to check authorization
    const request = await getRequestById(recapData.request_id)

    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 })
    }

    // Only the request creator can submit a recap
    if (session.user.id !== request.user_id.toString()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Check if the request requires a recap
    if (request.status !== "recap_needed") {
      return NextResponse.json(
        {
          error: "This request does not require a recap",
        },
        { status: 400 },
      )
    }

    // Create the recap
    const newRecap = await createRecap({
      request_id: recapData.request_id,
      user_id: new ObjectId(session.user.id),
      badge_number: session.user.badge_number,
      user_details: {
        name: session.user.name,
        department: session.user.department,
      },
      date: new Date(),
      actual_amount: Number.parseFloat(recapData.actual_amount),
      notes: recapData.notes,
      attachments: recapData.attachments,
      status: "submitted",
    })

    // Update the request status to approved (recap submitted)
    await updateRequestStatus(recapData.request_id, "approved")

    // Log the action
    await createAuditLog({
      user_id: new ObjectId(session.user.id),
      user_details: {
        name: session.user.name,
        badge_number: session.user.badge_number,
        role: session.user.role,
      },
      action_type: "create",
      timestamp: new Date(),
      description: `Submitted recap for request: ${recapData.request_id}`,
      target_id: newRecap.recap_id,
      target_type: "recap",
      ip_address: req.headers.get("x-forwarded-for") || undefined,
    })

    // Send notification
    await sendRecapSubmissionNotification(recapData.request_id, session.user.id, newRecap.recap_id)

    return NextResponse.json(newRecap, { status: 201 })
  } catch (error: any) {
    console.error("Error creating recap:", error)

    // Log error
    await createErrorLog({
      timestamp: new Date(),
      error_type: "API Error",
      message: `Error creating recap: ${error.message}`,
      stack_trace: error.stack,
      request_info: {
        method: "POST",
        url: "/api/recaps",
      },
    })

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
