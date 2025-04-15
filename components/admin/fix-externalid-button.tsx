"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export function FixExternalIdButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleFix = async () => {
    try {
      setIsLoading(true)
      setResult(null)

      const response = await fetch("/api/admin/fix-externalid-index", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (response.ok) {
        setResult({ success: true, message: data.message || "Index fixed successfully" })
      } else {
        setResult({ success: false, message: data.error || "Failed to fix index" })
      }
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "An unknown error occurred",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">Fix ExternalId Index</h3>
        <p className="text-sm text-muted-foreground">
          Fixes the duplicate key error with externalId by dropping the problematic index
        </p>
      </div>

      <Button onClick={handleFix} disabled={isLoading} variant="outline">
        {isLoading ? "Fixing..." : "Fix ExternalId Index"}
      </Button>

      {result && (
        <Alert variant={result.success ? "default" : "destructive"}>
          {result.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
          <AlertDescription>{result.message}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
