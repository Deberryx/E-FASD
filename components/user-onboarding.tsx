"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { completeUserOnboarding } from "@/app/actions/user-onboarding"

const formSchema = z.object({
  badge_number: z.string().min(3, {
    message: "Badge number must be at least 3 characters",
  }),
  department: z.string({
    required_error: "Please select a department",
  }),
})

interface UserOnboardingProps {
  user: any
}

export function UserOnboarding({ user }: UserOnboardingProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      badge_number: "",
      department: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    setError(null)

    try {
      const result = await completeUserOnboarding({
        userId: user.id,
        email: user.email,
        name: user.name,
        badge_number: values.badge_number,
        department: values.department,
        provider: user.provider,
        providerId: user.providerId,
      })

      if (result.success) {
        // Redirect to dashboard after successful onboarding
        router.push("/dashboard")
      } else {
        setError(result.error || "Failed to complete onboarding. Please try again.")
        setIsSubmitting(false)
      }
    } catch (error: any) {
      console.error("Error during onboarding:", error)
      setError(error.message || "An unexpected error occurred. Please try again.")
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Complete Your Profile</CardTitle>
        <CardDescription>
          Please provide your badge number and department to complete your account setup.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="badge_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Badge Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your badge number" {...field} />
                  </FormControl>
                  <FormDescription>Your employee badge number (e.g., EMP001)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your department" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Administrative and HR">Administrative and HR</SelectItem>
                      <SelectItem value="Monitoring and Evaluation">Monitoring and Evaluation</SelectItem>
                      <SelectItem value="Executive">Executive</SelectItem>
                      <SelectItem value="Programs">Programs</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>The department you belong to</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <CardFooter className="flex justify-end gap-2 px-0 pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Complete Setup"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
