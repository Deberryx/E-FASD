import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const publicPaths = ["/login", "/api/auth", "/api/debug"]
  const isPublicPath = publicPaths.some((publicPath) => path === publicPath || path.startsWith(`${publicPath}/`))

  // Check if the path is a public path
  if (isPublicPath) {
    return NextResponse.next()
  }

  // Get the session token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // If no token, redirect to login
  if (!token) {
    const url = new URL("/login", request.url)
    url.searchParams.set("callbackUrl", encodeURI(request.url))
    return NextResponse.redirect(url)
  }

  // Check if user account is locked
  if (token.status === "locked") {
    // If trying to access API, return 403
    if (path.startsWith("/api/")) {
      return new NextResponse(JSON.stringify({ error: "Your account is locked. Please contact an administrator." }), {
        status: 403,
        headers: { "content-type": "application/json" },
      })
    }

    // Otherwise redirect to a locked account page
    return NextResponse.redirect(new URL("/account-locked", request.url))
  }

  // Admin-only routes
  const adminOnlyPaths = ["/admin"]
  const isAdminOnlyPath = adminOnlyPaths.some((adminPath) => path === adminPath || path.startsWith(`${adminPath}/`))

  if (isAdminOnlyPath && token.role !== "Admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Finance-only routes
  const financeOnlyPaths = ["/dashboard/reports", "/dashboard/disbursements"]
  const isFinanceOnlyPath = financeOnlyPaths.some(
    (financePath) => path === financePath || path.startsWith(`${financePath}/`),
  )

  const financeRoles = [
    "Finance User Group",
    "Head of Finance",
    "Disburser",
    "Accounts Officer",
    "GRC Manager",
    "Admin",
  ]

  if (isFinanceOnlyPath && !financeRoles.includes(token.role as string)) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
