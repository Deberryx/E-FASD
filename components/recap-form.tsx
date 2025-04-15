"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Upload } from "lucide-react"

const formSchema = z.object({
  actualAmount: z.string().refine((val) => !isNaN(Number.parseFloat(val)), {
    message: "Amount must be a valid number",
  }),
  notes: z.string().min(10, {
    message: "Notes must be at least 10 characters",
  }),
})

interface RecapFormProps {
  requestId: string
  onCancel: () => void
}

export function RecapForm({ requestId, onCancel }: RecapFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      actualAmount: "",
      notes: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    // In a real app, this would submit to an API
    console.log({ requestId, ...values })

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      router.push("/dashboard?recap=success")
    }, 1500)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="actualAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Actual Amount Spent (GHS)</FormLabel>
              <FormControl>
                <Input placeholder="0.00" {...field} />
              </FormControl>
              <FormDescription>Enter the actual amount spent in Ghana Cedis (GHS)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Provide details on how the funds were used"
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <FormLabel>Receipts & Attachments</FormLabel>
          <div className="mt-2 flex items-center justify-center w-full">
            <label
              htmlFor="recap-file-upload"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/40 hover:bg-muted"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="h-6 w-6 mb-2 text-muted-foreground" />
                <p className="mb-2 text-sm text-muted-foreground">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">PDF or images (MAX. 5MB)</p>
              </div>
              <input id="recap-file-upload" type="file" className="hidden" />
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Recap"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
