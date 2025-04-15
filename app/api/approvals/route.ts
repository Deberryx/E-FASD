import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { getAllApprovals, createApproval, getApprovalsByRequestId, getApprovalsByApproverId } from "@/lib/db/approvals"
import { getRequestById, updateRequestStatus } from "@/lib/db/requests"
import { createAuditLog } from "@/lib/db/audit-logs"
import { createErrorLog } from "@/lib/db/error-logs"
import { sendApprovalNotification } from "@/lib/notification"
import { ObjectId } from "mongodb"
import { getNextApproverRole } from "@/lib/utils"

// GET /api/approvals - Get approvals with optional filters
export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(req.url)
    const requestId = url.searchParams.get("requestId")
    const approverId = url.searchParams.get("approverId")

    let approvals

    if (requestId) {
      approvals = await getApprovalsByRequestId(requestId)
    } else if (approverId) {
      approvals = await getApprovalsByApproverId(approverId)
    } else {
      // Only Admin and Finance can see all approvals
      if (session.user.role !== "Admin" && session.user.role !== "Finance User Group") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
      approvals = await getAllApprovals()
    }

    return NextResponse.json(approvals)
  } catch (error: any) {
    console.error("Error fetching approvals:", error)

    // Log error
    await createErrorLog({
      timestamp: new Date(),
      error_type: "API Error",
      message: `Error fetching approvals: ${error.message}`,
      stack_trace: error.stack,
      request_info: {
        method: "GET",
        url: "/api/approvals",
      },
    })

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// POST /api/approvals - Create a new approval
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const approvalData = await req.json()

    // Validate required fields
    if (!approvalData.request_id || !approvalData.status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get the request to check authorization and update status
    const request = await getRequestById(approvalData.request_id)

    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 })
    }

    // Check if user has permission to approve this request
    let canApprove = false

    if (session.user.role === "Admin") {
      canApprove = true
    } else if (session.user.role === "Finance User Group" && request.department === session.user.department) {
      canApprove = true
    } else if (session.user.role === "Head of Department" && request.department === session.user.department) {
      canApprove = true
    } else if (session.user.role === "Supervisor" && request.department === session.user.department) {
      canApprove = true
    }

    if (!canApprove) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Create the approval
    const newApproval = await createApproval({
      request_id: approvalData.request_id,
      approver_id: new ObjectId(session.user.id),
      approver_details: {
        name: session.user.name,
        badge_number: session.user.badge_number,
        department: session.user.department,
        role: session.user.role,
      },
      status: approvalData.status,
      comments: approvalData.comments,
      timestamp: new Date(),
    })

    // Update the request status
    await updateRequestStatus(approvalData.request_id, approvalData.status)

    // Log the action
    await createAuditLog({
      user_id: new ObjectId(session.user.id),
      user_details: {
        name: session.user.name,
        badge_number: session.user.badge_number,
        role: session.user.role,
      },
      action_type: approvalData.status === "approved" ? "approve" : "reject",
      timestamp: new Date(),
      description: `${approvalData.status === "approved" ? "Approved" : "Rejected"} request: ${approvalData.request_id}`,
      target_id: approvalData.request_id,
      target_type: "request",
      ip_address: req.headers.get("x-forwarded-for") || undefined,
    })

    // Send notification to the request creator
    await sendApprovalNotification(
      approvalData.request_id,
      request.user_id.toString(),
      approvalData.status,
      approvalData.comments,
    )

    // If approved and not the final approver, update request status back to pending
    const nextRole = getNextApproverRole(session.user.role)
    if (approvalData.status === "approved" && nextRole) {
      await updateRequestStatus(approvalData.request_id, "pending")
    }

    return NextResponse.json(newApproval, { status: 201 })
  } catch (error: any) {
    console.error("Error creating approval:", error)

    // Log error
    await createErrorLog({
      timestamp: new Date(),
      error_type: "API Error",
      message: `Error creating approval: ${error.message}`,
      stack_trace: error.stack,
      request_info: {
        method: "POST",
        url: "/api/approvals",
      },
    })

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
