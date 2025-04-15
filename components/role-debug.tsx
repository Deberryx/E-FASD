"use client"

import { useSession } from "next-auth/react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function RoleDebug() {
  const { data: session } = useSession()

  if (!session) return null

  const isAdmin = session.user.role === "Admin"

  if (!isAdmin) return null

  return (
    <Alert className="bg-amber-100 dark:bg-amber-900 text-amber-900 dark:text-amber-100 border-amber-300 dark:border-amber-700 mb-6">
      <ShieldAlert className="h-4 w-4" />
      <AlertTitle>Admin Access Available</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <p>You have admin privileges. You can access the admin dashboard.</p>
        <Link href="/admin" className="self-start">
          <Button
            size="sm"
            variant="outline"
            className="border-amber-500 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-800"
          >
            <ShieldAlert className="mr-2 h-4 w-4" />
            Go to Admin Dashboard
          </Button>
        </Link>
      </AlertDescription>
    </Alert>
  )
}
