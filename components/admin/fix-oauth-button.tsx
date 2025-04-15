"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"

export function FixOAuthButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFixOAuth = async () => {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch("/api/admin/fix-oauth-accounts")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fix OAuth accounts")
      }

      setResult(data)
    } catch (err) {
      console.error("Error fixing OAuth accounts:", err)
      setError(err.message || "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fix OAuth Account Linking</CardTitle>
        <CardDescription>
          Resolve issues with Microsoft account linking and the "OAuthAccountNotLinked" error
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">This will fix issues with Microsoft account linking by:</p>
        <ul className="list-disc pl-5 text-sm text-muted-foreground mb-4">
          <li>Migrating legacy externalId fields to the new external_accounts structure</li>
          <li>Removing the problematic externalId index</li>
          <li>Fixing orphaned OAuth accounts</li>
          <li>Ensuring all users have the correct auth_type</li>
        </ul>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result && (
          <Alert className="mt-4 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-700">
              {result.message}
              {result.results.details.length > 0 && (
                <details className="mt-2">
                  <summary className="cursor-pointer font-medium">View details</summary>
                  <ul className="mt-2 text-xs space-y-1">
                    {result.results.details.map((detail, index) => (
                      <li key={index}>
                        {detail.user ? `${detail.user}: ` : ""}
                        {detail.action}
                        {detail.count ? ` (${detail.count})` : ""}
                        {detail.externalId ? ` (${detail.externalId})` : ""}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleFixOAuth} disabled={isLoading} className="w-full">
          {isLoading ? "Fixing..." : "Fix OAuth Account Linking"}
        </Button>
      </CardFooter>
    </Card>
  )
}
