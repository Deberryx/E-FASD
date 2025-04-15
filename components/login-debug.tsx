"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export function LoginDebug() {
  const [showDebug, setShowDebug] = useState(false)
  const [debugData, setDebugData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkSession = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/debug/auth")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setDebugData(data)
    } catch (err) {
      console.error("Error checking session:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch session data")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-4 w-full">
      <div className="text-center">
        <Button variant="link" className="text-xs text-muted-foreground" onClick={() => setShowDebug(!showDebug)}>
          {showDebug ? "Hide Debug" : "Login Debug"}
        </Button>
      </div>

      {showDebug && (
        <div className="mt-2 p-4 border rounded-md">
          <Button size="sm" className="mb-2" onClick={checkSession} disabled={loading}>
            {loading ? "Checking..." : "Check Session"}
          </Button>

          {error && (
            <pre className="text-xs bg-red-50 text-red-600 p-2 rounded-md overflow-auto">
              {JSON.stringify({ error }, null, 2)}
            </pre>
          )}

          {debugData && (
            <pre className="text-xs bg-slate-50 p-2 rounded-md overflow-auto">{JSON.stringify(debugData, null, 2)}</pre>
          )}
        </div>
      )}
    </div>
  )
}
