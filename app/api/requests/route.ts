import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import {
  getAllRequests,
  createRequest,
  getRequestsByUserId,
  getRequestsByDepartment,
  getRequestsByStatus,
  getRequestsByType,
  getRequestsByDateRange,
} from "@/lib/db/requests"
import { createAuditLog } from "@/lib/db/audit-logs"
import { createErrorLog } from "@/lib/db/error-logs"
import { sendRequestSubmissionNotification } from "@/lib/notification"
import { validatePettyCashAmount } from "@/lib/utils"
import { ObjectId } from "mongodb"

// GET /api/requests - Get requests with optional filters
export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(req.url)
    const userId = url.searchParams.get("userId")
    const department = url.searchParams.get("department")
    const status = url.searchParams.get("status")
    const type = url.searchParams.get("type") as "Petty Cash" | "Requisition" | null
    const startDate = url.searchParams.get("startDate")
    const endDate = url.searchParams.get("endDate")

    let requests

    // Apply filters based on user role and query parameters
    if (session.user.role === "Admin" || session.user.role === "Finance User Group") {
      // Admins and Finance can see all requests with optional filters
      if (userId) {
        requests = await getRequestsByUserId(userId)
      } else if (department) {
        requests = await getRequestsByDepartment(department)
      } else if (status) {
        requests = await getRequestsByStatus(status)
      } else if (type) {
        requests = await getRequestsByType(type)
      } else if (startDate && endDate) {
        requests = await getRequestsByDateRange(new Date(startDate), new Date(endDate))
      } else {
        requests = await getAllRequests()
      }
    } else if (session.user.role === "Head of Department") {
      // Department heads can only see requests from their department
      requests = await getRequestsByDepartment(session.user.department)
    } else if (session.user.role === "Supervisor") {
      // Supervisors can only see requests from their department
      requests = await getRequestsByDepartment(session.user.department)
    } else {
      // Regular users can only see their own requests
      requests = await getRequestsByUserId(session.user.id)
    }

    return NextResponse.json(requests)
  } catch (error: any) {
    console.error("Error fetching requests:", error)

    // Log error
    await createErrorLog({
      timestamp: new Date(),
      error_type: "API Error",
      message: `Error fetching requests: ${error.message}`,
      stack_trace: error.stack,
      request_info: {
        method: "GET",
        url: "/api/requests",
      },
    })

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// POST /api/requests - Create a new request
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const requestData = await req.json()

    // Validate required fields
    if (!requestData.type_of_request || !requestData.amount || !requestData.purpose) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate petty cash amount (must be <= 500 GHS)
    if (
      requestData.type_of_request === "Petty Cash" &&
      !validatePettyCashAmount(Number.parseFloat(requestData.amount))
    ) {
      return NextResponse.json(
        {
          error: "Petty cash requests cannot exceed 500 GHS",
        },
        { status: 400 },
      )
    }

    // Create the request
    const newRequest = await createRequest({
      user_id: new ObjectId(session.user.id),
      badge_number: session.user.badge_number,
      type_of_request: requestData.type_of_request,
      date: new Date(),
      department: session.user.department,
      amount: Number.parseFloat(requestData.amount),
      purpose: requestData.purpose,
      details: requestData.details,
      items: requestData.items,
      attachments: requestData.attachments,
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
      description: `Created new ${requestData.type_of_request} request`,
      target_id: newRequest._id?.toString(),
      target_type: "request",
      ip_address: req.headers.get("x-forwarded-for") || undefined,
    })

    // Send notification
    await sendRequestSubmissionNotification(newRequest.request_id, session.user.id)

    return NextResponse.json(newRequest, { status: 201 })
  } catch (error: any) {
    console.error("Error creating request:", error)

    // Log error
    const requestData = await req.json()
    await createErrorLog({
      timestamp: new Date(),
      error_type: "API Error",
      message: `Error creating request: ${error.message}`,
      stack_trace: error.stack,
      request_info: {
        method: "POST",
        url: "/api/requests",
        body: requestData,
      },
    })

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
