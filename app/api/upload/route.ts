import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { uploadFile, generateUniqueBlobName } from "@/lib/azure-storage"
import { createErrorLog } from "@/lib/db/error-logs"

// POST /api/upload - Upload a file to Azure Blob Storage
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size exceeds 5MB limit" }, { status: 400 })
    }

    // Check file type (only allow PDF and images)
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: "Only PDF and image files are allowed",
        },
        { status: 400 },
      )
    }

    // Generate a unique blob name
    const blobName = generateUniqueBlobName(file.name)

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Upload to Azure Blob Storage
    const containerName = "ecash-attachments"
    const url = await uploadFile(containerName, blobName, buffer, file.type)

    return NextResponse.json({
      success: true,
      url,
      name: file.name,
      content_type: file.type,
      size: file.size,
    })
  } catch (error: any) {
    console.error("Error uploading file:", error)

    // Log error
    await createErrorLog({
      timestamp: new Date(),
      error_type: "API Error",
      message: `Error uploading file: ${error.message}`,
      stack_trace: error.stack,
      request_info: {
        method: "POST",
        url: "/api/upload",
      },
    })

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
