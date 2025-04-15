"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { createRecap } from "@/lib/db/recaps"
import { getRequestById, updateRequestStatus } from "@/lib/db/requests"
import { createAuditLog } from "@/lib/db/audit-logs"
import { createErrorLog } from "@/lib/db/error-logs"
import { sendRecapSubmissionNotification } from "@/lib/notification"
import { ObjectId } from "mongodb"

// Create a new recap
export async function createRecapAction(formData: FormData) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      throw new Error("Unauthorized")
    }

    // Extract form data
    const requestId = formData.get("request_id") as string
    const actualAmount = Number.parseFloat(formData.get("actual_amount") as string)
    const notes = formData.get("notes") as string

    // Validate required fields
    if (!requestId || !actualAmount || !notes) {
      throw new Error("Missing required fields")
    }

    // Get the request to check authorization
    const request = await getRequestById(requestId)

    if (!request) {
      throw new Error("Request not found")
    }

    // Only the request creator can submit a recap
    if (session.user.id !== request.user_id.toString()) {
      throw new Error("You do not have permission to submit a recap for this request")
    }

    // Check if the request requires a recap
    if (request.status !== "recap_needed") {
      throw new Error("This request does not require a recap")
    }

    // Process attachments
    const attachments = []
    const attachmentUrls = formData.get("attachmentUrls") as string

    if (attachmentUrls) {
      const urls = JSON.parse(attachmentUrls)
      for (const attachment of urls) {
        attachments.push({
          name: attachment.name,
          url: attachment.url,
          content_type: attachment.content_type,
          size: attachment.size,
          uploaded_at: new Date(),
        })
      }
    }

    // Create the recap
    const newRecap = await createRecap({
      request_id: requestId,
      user_id: new ObjectId(session.user.id),
      badge_number: session.user.badge_number,
      user_details: {
        name: session.user.name,
        department: session.user.department,
      },
      date: new Date(),
      actual_amount: actualAmount,
      notes,
      attachments,
      status: "submitted",
    })

    // Update the request status to approved (recap submitted)
    await updateRequestStatus(requestId, "approved")

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
      description: `Submitted recap for request: ${requestId}`,
      target_id: newRecap.recap_id,
      target_type: "recap",
    })

    // Send notification
    await sendRecapSubmissionNotification(requestId, session.user.id, newRecap.recap_id)

    // Revalidate the recaps page
    revalidatePath("/dashboard/recaps")
    revalidatePath(`/dashboard/requests/${requestId}`)

    return { success: true, recapId: newRecap.recap_id }
  } catch (error: any) {
    console.error("Error creating recap:", error)

    // Log error
    await createErrorLog({
      timestamp: new Date(),
      error_type: "Server Action Error",
      message: `Error creating recap: ${error.message}`,
      stack_trace: error.stack,
      request_info: {
        method: "POST",
        url: "/actions/recaps",
      },
    })

    return { success: false, error: error.message }
  }
}
