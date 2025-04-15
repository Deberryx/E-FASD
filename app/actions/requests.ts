"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { createRequest, deleteRequest } from "@/lib/db/requests"
import { createAuditLog } from "@/lib/db/audit-logs"
import { createErrorLog } from "@/lib/db/error-logs"
import { sendRequestSubmissionNotification } from "@/lib/notification"
import { validatePettyCashAmount } from "@/lib/utils"
import { ObjectId } from "mongodb"

// Create a new request
export async function createRequestAction(formData: FormData) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      throw new Error("Unauthorized")
    }

    // Extract form data
    const type = formData.get("type_of_request") as string
    const amount = Number.parseFloat(formData.get("amount") as string)
    const purpose = formData.get("purpose") as string
    const details = formData.get("details") as string

    // Validate required fields
    if (!type || !amount || !purpose) {
      throw new Error("Missing required fields")
    }

    // Validate petty cash amount (must be <= 500 GHS)
    if (type === "Petty Cash" && !validatePettyCashAmount(amount)) {
      throw new Error("Petty cash requests cannot exceed 500 GHS")
    }

    // Process items for requisition
    const items = []
    if (type === "Requisition") {
      const itemCount = Number.parseInt(formData.get("itemCount") as string) || 0

      for (let i = 0; i < itemCount; i++) {
        const description = formData.get(`items[${i}].description`) as string
        const quantity = Number.parseInt(formData.get(`items[${i}].quantity`) as string)
        const unitPrice = Number.parseFloat(formData.get(`items[${i}].unitPrice`) as string)

        if (description && quantity && unitPrice) {
          items.push({ description, quantity, unit_price: unitPrice })
        }
      }
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

    // Create the request
    const newRequest = await createRequest({
      user_id: new ObjectId(session.user.id),
      badge_number: session.user.badge_number,
      type_of_request: type as "Petty Cash" | "Requisition",
      date: new Date(),
      department: session.user.department,
      amount,
      purpose,
      details,
      items,
      attachments,
      status: "pending",
    })

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
      description: `Created new ${type} request`,
      target_id: newRequest._id?.toString(),
      target_type: "request",
    })

    // Send notification
    await sendRequestSubmissionNotification(newRequest.request_id, session.user.id)

    // Revalidate the requests page
    revalidatePath("/dashboard/requests")

    // Redirect to the request details page
    return { success: true, requestId: newRequest._id?.toString() }
  } catch (error: any) {
    console.error("Error creating request:", error)

    // Log error
    await createErrorLog({
      timestamp: new Date(),
      error_type: "Server Action Error",
      message: `Error creating request: ${error.message}`,
      stack_trace: error.stack,
      request_info: {
        method: "POST",
        url: "/actions/requests",
      },
    })

    return { success: false, error: error.message }
  }
}

// Delete a request
export async function deleteRequestAction(requestId: string) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      throw new Error("Unauthorized")
    }

    const success = await deleteRequest(requestId)

    if (!success) {
      throw new Error("Request not found or could not be deleted")
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
      description: `Deleted request: ${requestId}`,
      target_id: requestId,
      target_type: "request",
    })

    // Revalidate the requests page
    revalidatePath("/dashboard/requests")

    return { success: true }
  } catch (error: any) {
    console.error("Error deleting request:", error)

    // Log error
    await createErrorLog({
      timestamp: new Date(),
      error_type: "Server Action Error",
      message: `Error deleting request: ${error.message}`,
      stack_trace: error.stack,
      request_info: {
        method: "DELETE",
        url: `/actions/requests/${requestId}`,
      },
    })

    return { success: false, error: error.message }
  }
}
