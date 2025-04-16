"use client"

import type React from "react"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { MicrosoftLogo } from "@/components/microsoft-logo"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSearchParams, useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LoginDebug } from "@/components/login-debug"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("test@example.com")
  const [password, setPassword] = useState("password")
  const [role, setRole] = useState("Admin")
  const [showTestLogin, setShowTestLogin] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)

  const searchParams = useSearchParams()
  const error = searchParams.get("error")
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"

  const handleMicrosoftLogin = async () => {
    setIsLoading(true)
    setLoginError(null)
    await signIn("azure-ad", { callbackUrl })
  }

  const handleTestLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setLoginError(null)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        role,
        redirect: false,
      })

      if (result?.error) {
        console.error("Login error:", result.error)
        setLoginError(result.error)
        setIsLoading(false)
      } else if (result?.ok) {
        // Successful login
        router.push(callbackUrl)
      }
    } catch (error) {
      console.error("Login error:", error)
      setLoginError("An unexpected error occurred")
      setIsLoading(false)
    }
  }

  // Format error messages for better user experience
  const getErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case "OAuthAccountNotLinked":
        return "This email is already associated with another account. Please sign in using your original method or contact an administrator for help."
      case "AccessDenied":
        return "Access denied. Please check your credentials or contact an administrator."
      case "CredentialsSignin":
        return "Invalid credentials. Please check your email and password."
      default:
        return `Authentication error: ${errorCode}`
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/15_Ann_branding-07-removebg-preview-Or2QREXGzmVAgARQT9Vgc3S6LXNF9H.png"
              alt="AGAMal Logo"
              width={240}
              height={80}
              className="rounded-md"
            />
          </div>
          <CardTitle className="text-2xl font-bold">E-Cash Request System</CardTitle>
          <CardDescription>Login with your organization account to continue</CardDescription>

          {(error || loginError) && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error ? getErrorMessage(error) : loginError}</AlertDescription>
            </Alert>
          )}
        </CardHeader>

        <CardContent className="grid gap-4">
          <Button
            variant="outline"
            className="w-full flex items-center gap-2"
            onClick={handleMicrosoftLogin}
            disabled={isLoading}
          >
            <MicrosoftLogo className="h-5 w-5" />
            {isLoading && !showTestLogin ? "Signing in..." : "Sign in with Microsoft"}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span
                className="bg-background px-2 text-muted-foreground cursor-pointer"
                onClick={() => setShowTestLogin(!showTestLogin)}
              >
                {showTestLogin ? "HIDE TEST LOGIN" : "SHOW TEST LOGIN"}
              </span>
            </div>
          </div>

          {showTestLogin && (
            <form onSubmit={handleTestLogin} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="test@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="role">Test Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="User">User</SelectItem>
                    <SelectItem value="Supervisor">Supervisor</SelectItem>
                    <SelectItem value="Head of Department">Head of Department</SelectItem>
                    <SelectItem value="Head of Admin & HR">Head of Admin & HR</SelectItem>
                    <SelectItem value="Head of Finance">Head of Finance</SelectItem>
                    <SelectItem value="Finance User Group">Finance User Group</SelectItem>
                    <SelectItem value="Disburser">Disburser</SelectItem>
                    <SelectItem value="Accounts Officer">Accounts Officer</SelectItem>
                    <SelectItem value="GRC Manager">GRC Manager</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign in with Test Account"}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                For testing only. Use email: test@example.com and password: password
              </p>
            </form>
          )}
        </CardContent>

        <CardFooter className="flex flex-col">
          <p className="text-xs text-center text-muted-foreground mt-2">
            Only organization accounts are allowed. Personal accounts will not work.
          </p>
          <LoginDebug />
        </CardFooter>
      </Card>
    </div>
  )
}
