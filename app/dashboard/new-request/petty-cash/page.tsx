"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload } from "lucide-react"
import { createRequestAction } from "@/app/actions/requests"
import { useToast } from "@/hooks/use-toast"
import { BackButton } from "@/components/back-button"

const formSchema = z.object({
  amount: z
    .string()
    .refine((val) => !isNaN(Number.parseFloat(val)), {
      message: "Amount must be a valid number",
    })
    .refine((val) => Number.parseFloat(val) <= 500, {
      message: "Petty cash requests cannot exceed 500 GHS",
    }),
  purpose: z.string().min(10, {
    message: "Purpose must be at least 10 characters",
  }),
  details: z.string().optional(),
})

export default function PettyCashRequestPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [attachments, setAttachments] = useState<any[]>([])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: "",
      purpose: "",
      details: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    try {
      // Create FormData for the server action
      const formData = new FormData()
      formData.append("type_of_request", "Petty Cash")
      formData.append("amount", values.amount)
      formData.append("purpose", values.purpose)
      formData.append("details", values.details || "")

      // Add attachments if any
      if (attachments.length > 0) {
        formData.append("attachmentUrls", JSON.stringify(attachments))
      }

      // Submit the form using the server action
      const result = await createRequestAction(formData)

      if (result.success) {
        toast({
          title: "Request Submitted",
          description: "Your petty cash request has been submitted successfully.",
        })
        router.push("/dashboard?success=true")
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to submit request. Please try again.",
          variant: "destructive",
        })
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error("Error submitting request:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const file = files[0]

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "File size exceeds 5MB limit.",
        variant: "destructive",
      })
      return
    }

    // Check file type
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Only PDF and image files are allowed.",
        variant: "destructive",
      })
      return
    }

    try {
      // Create FormData for file upload
      const formData = new FormData()
      formData.append("file", file)

      // Upload the file
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to upload file")
      }

      const data = await response.json()

      // Add the uploaded file to attachments
      setAttachments([
        ...attachments,
        {
          name: data.name,
          url: data.url,
          content_type: data.content_type,
          size: data.size,
        },
      ])

      toast({
        title: "File Uploaded",
        description: "File has been uploaded successfully.",
      })
    } catch (error) {
      console.error("Error uploading file:", error)
      toast({
        title: "Upload Failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <BackButton />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Petty Cash Request</CardTitle>
          <CardDescription>Submit a new petty cash request. Maximum amount is 500 GHS.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (GHS)</FormLabel>
                    <FormControl>
                      <Input placeholder="0.00" {...field} />
                    </FormControl>
                    <FormDescription>Enter the amount in Ghana Cedis (GHS). Maximum: 500 GHS</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="purpose"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purpose</FormLabel>
                    <FormControl>
                      <Input placeholder="Brief purpose of the request" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="details"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Details</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide any additional details about this request"
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <FormLabel>Attachments</FormLabel>
                {attachments.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center p-2 border rounded">
                        <span className="text-sm">{attachment.name}</span>
                        <span className="ml-auto text-xs text-muted-foreground">
                          {Math.round(attachment.size / 1024)} KB
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-2 flex items-center justify-center w-full">
                  <label
                    htmlFor="file-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/40 hover:bg-muted"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="h-6 w-6 mb-2 text-muted-foreground" />
                      <p className="mb-2 text-sm text-muted-foreground">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">PDF or images (MAX. 5MB)</p>
                    </div>
                    <input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      onChange={handleFileUpload}
                      accept=".pdf,.jpg,.jpeg,.png,.gif"
                    />
                  </label>
                </div>
              </div>

              <CardFooter className="flex justify-end gap-2 px-0">
                <Button variant="outline" type="button" onClick={() => router.push("/dashboard")}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Request"}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
