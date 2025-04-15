import type React from "react"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { DashboardNav } from "@/components/dashboard-nav"
import { UserNav } from "@/components/user-nav"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ShieldAlert } from "lucide-react"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get the user session
  const session = await getServerSession(authOptions)

  // If not authenticated, redirect to login
  if (!session) {
    redirect("/login")
  }

  // If user is new and needs onboarding, redirect to onboarding page
  if (session.user.isNewUser) {
    redirect("/onboarding")
  }

  const isAdmin = session.user.role === "Admin"

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-6">
        <div className="flex flex-1 items-center gap-4 md:gap-8">
          <h1 className="text-xl font-semibold">E-Cash Request System</h1>
        </div>
        <div className="flex items-center gap-4">
          {isAdmin && (
            <Link href="/admin">
              <Button variant="outline" size="sm" className="gap-2">
                <ShieldAlert className="h-4 w-4" />
                Admin Dashboard
              </Button>
            </Link>
          )}
          <ModeToggle />
          <UserNav user={session.user} />
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="hidden w-64 border-r bg-muted/40 lg:block">
          <DashboardNav userRole={session.user.role} />
        </aside>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
