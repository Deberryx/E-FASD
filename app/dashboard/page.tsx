import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { RoleDashboard } from "@/components/role-dashboard"

export default async function DashboardPage() {
  // Get the user session
  const session = await getServerSession(authOptions)

  // If not authenticated, redirect to login
  if (!session) {
    redirect("/login")
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      <RoleDashboard
        userRole={session.user.role}
        userName={session.user.name}
        userDepartment={session.user.department}
      />
    </div>
  )
}
