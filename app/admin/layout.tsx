import type React from "react"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { AdminNav } from "@/components/admin/admin-nav"
import { UserNav } from "@/components/user-nav"
import { ModeToggle } from "@/components/mode-toggle"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get the user session
  const session = await getServerSession(authOptions)

  // If not authenticated or not an admin, redirect to login
  if (!session || session.user.role !== "Admin") {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-6">
        <div className="flex flex-1 items-center gap-4 md:gap-8">
          <h1 className="text-xl font-semibold">E-Cash Admin Dashboard</h1>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <ModeToggle />
          <UserNav user={session.user} />
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="hidden w-64 border-r bg-muted/40 lg:block">
          <AdminNav />
        </aside>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
