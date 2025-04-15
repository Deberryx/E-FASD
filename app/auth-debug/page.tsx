"use client"

import { useState, useEffect } from "react"
import { signIn, signOut, useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function AuthDebugPage() {
  const { data: session, status } = useSession()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Get error from URL if present
    const urlParams = new URLSearchParams(window.location.search)
    const errorParam = urlParams.get("error")
    if (errorParam) {
      setError(errorParam)
    }
  }, [])

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Authentication Debug</CardTitle>
          <CardDescription>Diagnose authentication issues</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Authentication Status</h3>
            <p className="text-sm text-muted-foreground">
              Current status: <span className="font-bold">{status}</span>
            </p>
          </div>

          {error && (
            <div className="p-4 border border-red-200 bg-red-50 rounded-md">
              <h3 className="text-lg font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {session && (
            <div>
              <h3 className="text-lg font-medium">Session Data</h3>
              <pre className="p-4 bg-muted rounded-md overflow-auto text-xs">{JSON.stringify(session, null, 2)}</pre>
            </div>
          )}

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Environment Check</h3>
            <p className="text-sm">NEXTAUTH_URL: {process.env.NEXTAUTH_URL || "Not set"}</p>
            <p className="text-sm">AZURE_AD_CLIENT_ID: {process.env.AZURE_AD_CLIENT_ID ? "Set" : "Not set"}</p>
            <p className="text-sm">AZURE_AD_CLIENT_SECRET: {process.env.AZURE_AD_CLIENT_SECRET ? "Set" : "Not set"}</p>
            <p className="text-sm">AZURE_AD_TENANT_ID: {process.env.AZURE_AD_TENANT_ID ? "Set" : "Not set"}</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button onClick={() => signIn("azure-ad")}>Sign In with Azure AD</Button>
          {session && (
            <Button variant="outline" onClick={() => signOut()}>
              Sign Out
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
