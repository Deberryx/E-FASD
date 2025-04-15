import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/mongodb"
import { createAuditLog } from "@/lib/db/audit-logs"
import { createErrorLog } from "@/lib/db/error-logs"
import { ObjectId } from "mongodb"

// GET /api/admin/departments - Get all departments
export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only Admin can access departments
    if (session.user.role !== "Admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB)

    // Get departments with user counts
    const departments = await db
      .collection("departments")
      .aggregate([
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "department_id",
            as: "members",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "head_id",
            foreignField: "_id",
            as: "head",
          },
        },
        {
          $project: {
            id: { $toString: "$_id" },
            name: 1,
            code: 1,
            description: 1,
            headId: { $toString: "$head_id" },
            headName: { $arrayElemAt: ["$head.name", 0] },
            memberCount: { $size: "$members" },
          },
        },
      ])
      .toArray()

    return NextResponse.json(departments)
  } catch (error: any) {
    console.error("Error fetching departments:", error)

    // Log error
    await createErrorLog({
      timestamp: new Date(),
      error_type: "API Error",
      message: `Error fetching departments: ${error.message}`,
      stack_trace: error.stack,
      request_info: {
        method: "GET",
        url: "/api/admin/departments",
      },
    })

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// POST /api/admin/departments - Create a new department
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only Admin can create departments
    if (session.user.role !== "Admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const departmentData = await req.json()

    // Validate required fields
    if (!departmentData.name || !departmentData.code) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB)

    // Check if department with same code already exists
    const existingDepartment = await db.collection("departments").findOne({ code: departmentData.code })
    if (existingDepartment) {
      return NextResponse.json({ error: "Department with this code already exists" }, { status: 409 })
    }

    // Create new department
    const newDepartment = {
      name: departmentData.name,
      code: departmentData.code,
      description: departmentData.description || "",
      head_id: departmentData.headId ? new ObjectId(departmentData.headId) : null,
      created_at: new Date(),
      updated_at: new Date(),
    }

    const result = await db.collection("departments").insertOne(newDepartment)

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
      description: `Created new department: ${departmentData.name} (${departmentData.code})`,
      target_id: result.insertedId.toString(),
      target_type: "department",
      ip_address: req.headers.get("x-forwarded-for") || undefined,
    })

    // Return the created department
    return NextResponse.json(
      {
        id: result.insertedId.toString(),
        name: newDepartment.name,
        code: newDepartment.code,
        description: newDepartment.description,
        headId: newDepartment.head_id ? newDepartment.head_id.toString() : null,
        headName: null, // We don't have this information yet
        memberCount: 0,
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error("Error creating department:", error)

    // Log error
    await createErrorLog({
      timestamp: new Date(),
      error_type: "API Error",
      message: `Error creating department: ${error.message}`,
      stack_trace: error.stack,
      request_info: {
        method: "POST",
        url: "/api/admin/departments",
      },
    })

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
