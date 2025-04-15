import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    return NextResponse.json({
      authenticated: !!session,
      session,
      env: {
        nextAuthUrl: process.env.NEXTAUTH_URL || "Not set",
        azureAdClientId: process.env.AZURE_AD_CLIENT_ID ? "Set" : "Not set",
        azureAdClientSecret: process.env.AZURE_AD_CLIENT_SECRET ? "Set" : "Not set",
        azureAdTenantId: process.env.AZURE_AD_TENANT_ID ? "Set" : "Not set",
        nextAuthSecret: process.env.NEXTAUTH_SECRET ? "Set" : "Not set",
      },
    })
  } catch (error) {
    console.error("Auth debug error:", error)
    return NextResponse.json({ error: "Failed to get session data" }, { status: 500 })
  }
}
