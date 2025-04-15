import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email, password, role } = await request.json()

    // Validate test credentials
    if (email === "test@example.com" && password === "password") {
      return NextResponse.json({
        success: true,
        user: {
          id: `test-${role.toLowerCase().replace(/\s+/g, "-")}-id`,
          name: `Test ${role}`,
          email: "test@example.com",
          role: role,
          department: role.includes("Finance") ? "Finance" : role.includes("Admin") ? "Administrative and HR" : "IT",
          badge_number: `${role.substring(0, 3).toUpperCase()}001`,
          status: "active",
        },
      })
    }

    return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 })
  } catch (error) {
    console.error("Test account API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
