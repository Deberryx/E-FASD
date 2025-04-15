import { NextResponse } from "next/server"
import { initializeDatabase } from "@/lib/db/init-db"

// This route will be called during application startup
// to initialize the database
export async function GET() {
  try {
    await initializeDatabase()
    return NextResponse.json({ success: true, message: "Database initialized successfully" })
  } catch (error) {
    console.error("Error initializing database:", error)
    return NextResponse.json({ success: false, error: "Failed to initialize database" }, { status: 500 })
  }
}
