import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb-server"
import { serverOnly } from "@/lib/server-only"

// This ensures this module is only used on the server
console.log(serverOnly)

export async function GET() {
  try {
    // Check MongoDB connection
    const client = await clientPromise
    await client.db().admin().ping()

    return NextResponse.json({
      status: "healthy",
      database: {
        connected: true,
        name: process.env.MONGODB_DB || "ecash_system",
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("Health check failed:", error)

    return NextResponse.json(
      {
        status: "unhealthy",
        database: {
          connected: false,
          error: error.message,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
