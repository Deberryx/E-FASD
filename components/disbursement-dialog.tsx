"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { CreditCard } from "lucide-react"

const formSchema = z.object({
  verificationCode: z.string().min(6, {
    message: "Verification code must be at least 6 characters",
  }),
  confirmDisbursement: z.boolean().refine((val) => val === true, {
    message: "You must confirm the disbursement",
  }),
})

interface DisbursementDialogProps {
  disbursement: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete: (data: z.infer<typeof formSchema>) => void
}

export function DisbursementDialog({ disbursement, open, onOpenChange, onComplete }: DisbursementDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [verificationCode, setVerificationCode] = useState("123456") // In a real app, this would be generated

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      verificationCode: "",
      confirmDisbursement: false,
    },
  })

  function handleSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    // In a real app, this would verify the code against the backend
    if (values.verificationCode !== verificationCode) {
      form.setError("verificationCode", {
        type: "manual",
        message: "Invalid verification code",
      })
      setIsSubmitting(false)
      return
    }

    // Call the onComplete callback with the data
    onComplete(values)
  }

  // Generate a new verification code
  const generateNewCode = () => {
    // In a real app, this would call an API to generate a new code
    const newCode = Math.floor(100000 + Math.random() * 900000).toString()
    setVerificationCode(newCode)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Process Disbursement
          </DialogTitle>
          <DialogDescription>Verify and process disbursement for request {disbursement.requestId}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium">Request ID</div>
                <div>{disbursement.requestId}</div>
              </div>
              <div>
                <div className="text-sm font-medium">Amount</div>
                <div>GHS {disbursement.amount}</div>
              </div>
              <div>
                <div className="text-sm font-medium">Requester</div>
                <div>{disbursement.requester}</div>
              </div>
              <div>
                <div className="text-sm font-medium">Department</div>
                <div>{disbursement.department}</div>
              </div>
            </div>

            <div className="bg-muted p-3 rounded-md">
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm font-medium">Verification Code</div>
                <Button type="button" variant="outline" size="sm" onClick={generateNewCode}>
                  Generate New Code
                </Button>
              </div>
              <div className="p-2 bg-background border rounded-md text-center font-mono text-lg">
                {verificationCode}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Share this code with the requester to verify the disbursement
              </p>
            </div>

            <FormField
              control={form.control}
              name="verificationCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Enter Verification Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter the code provided by the requester" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmDisbursement"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      I confirm that I have disbursed GHS {disbursement.amount} to {disbursement.requester}
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Processing..." : "Complete Disbursement"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
