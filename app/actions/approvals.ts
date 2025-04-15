"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { createApproval } from "@/lib/db/approvals"
import { getRequestById, updateRequestStatus } from "@/lib/db/requests"
import { createAuditLog } from "@/lib/db/audit-logs"
import { createErrorLog } from "@/lib/db/error-logs"
import { sendApprovalNotification } from "@/lib/notification"
import { getNextApproverRole } from "@/lib/utils"
import { ObjectId } from "mongodb"

// Create a new approval
export async function createApprovalAction(formData: FormData) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      throw new Error("Unauthorized")
    }

    // Extract form data
    const requestId = formData.get("request_id") as string
    const status = formData.get("status") as "approved" | "rejected" | "recap_needed"
    const comments = formData.get("comments") as string

    // Validate required fields
    if (!requestId || !status) {
      throw new Error("Missing required fields")
    }

    // Get the request to check authorization and update status
    const request = await getRequestById(requestId)

    if (!request) {
      throw new Error("Request not found")
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
      throw new Error("You do not have permission to approve this request")
    }

    // Create the approval
    const newApproval = await createApproval({
      request_id: requestId,
      approver_id: new ObjectId(session.user.id),
      approver_details: {
        name: session.user.name,
        badge_number: session.user.badge_number,
        department: session.user.department,
        role: session.user.role,
      },
      status,
      comments,
      timestamp: new Date(),
    })

    // Update the request status
    await updateRequestStatus(requestId, status)

    // Log the action
    await createAuditLog({
      user_id: new ObjectId(session.user.id),
      user_details: {
        name: session.user.name,
        badge_number: session.user.badge_number,
        role: session.user.role,
      },
      action_type: status === "approved" ? "approve" : "reject",
      timestamp: new Date(),
      description: `${status === "approved" ? "Approved" : "Rejected"} request: ${requestId}`,
      target_id: requestId,
      target_type: "request",
    })

    // Send notification to the request creator
    await sendApprovalNotification(requestId, request.user_id.toString(), status, comments)

    // If approved and not the final approver, update request status back to pending
    const nextRole = getNextApproverRole(session.user.role)
    if (status === "approved" && nextRole) {
      await updateRequestStatus(requestId, "pending")
    }

    // Revalidate the approvals page
    revalidatePath("/dashboard/approvals")
    revalidatePath(`/dashboard/requests/${requestId}`)

    return { success: true, approvalId: newApproval.approval_id }
  } catch (error: any) {
    console.error("Error creating approval:", error)

    // Log error
    await createErrorLog({
      timestamp: new Date(),
      error_type: "Server Action Error",
      message: `Error creating approval: ${error.message}`,
      stack_trace: error.stack,
      request_info: {
        method: "POST",
        url: "/actions/approvals",
      },
    })

    return { success: false, error: error.message }
  }
}
