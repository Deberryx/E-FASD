"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function UserMigration() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleMigration = async () => {
    if (!confirm("Are you sure you want to migrate users? This will update all users in the database.")) {
      return
    }

    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch("/api/admin/migrate-users", {
        method: "POST",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to migrate users")
      }

      const data = await response.json()
      setResult(data.result)

      toast({
        title: "Migration Successful",
        description: `Successfully migrated ${data.result.migrated} users.`,
      })
    } catch (err: any) {
      console.error("Error during migration:", err)
      setError(err.message || "An unexpected error occurred")

      toast({
        title: "Migration Failed",
        description: err.message || "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Authentication Migration</CardTitle>
        <CardDescription>
          Migrate users from the old externalId field to the new external_accounts structure
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="mb-4">
          This will update all users in the database to use the new authentication structure. Users with externalId will
          be migrated to use external_accounts, and all users will have an auth_type assigned.
        </p>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result && (
          <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle>Migration Complete</AlertTitle>
            <AlertDescription>
              <ul className="list-disc pl-5 mt-2">
                <li>{result.migrated} users migrated successfully</li>
                <li>{result.localUsers} local users updated</li>
                {result.errors > 0 && <li className="text-amber-600">{result.errors} errors encountered</li>}
                {result.unmigrated > 0 && (
                  <li className="text-red-600">{result.unmigrated} users still need migration</li>
                )}
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleMigration} disabled={isLoading} className="gap-2">
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {isLoading ? "Migrating Users..." : "Start Migration"}
        </Button>
      </CardFooter>
    </Card>
  )
}
