"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { UserOnboarding } from "@/components/user-onboarding"

export default function OnboardingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    // If user is not authenticated, redirect to login
    if (status === "unauthenticated") {
      router.push("/login")
    }

    // If user is authenticated but not new, redirect to dashboard
    if (status === "authenticated" && session && !session.user.isNewUser) {
      router.push("/dashboard")
    }
  }, [session, status, router])

  // Show loading state while checking session
  if (status === "loading" || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/15_Ann_branding-07-removebg-preview-Or2QREXGzmVAgARQT9Vgc3S6LXNF9H.png"
            alt="AGAMal Logo"
            width={240}
            height={80}
            className="rounded-md"
          />
        </div>

        <UserOnboarding user={session.user} />
      </div>
    </div>
  )
}
