"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Plus, Trash2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BackButton } from "@/components/back-button"

const formSchema = z.object({
  title: z.string().min(5, {
    message: "Title must be at least 5 characters",
  }),
  department: z.string({
    required_error: "Please select a department",
  }),
  totalAmount: z.string().optional(),
  purpose: z.string().min(10, {
    message: "Purpose must be at least 10 characters",
  }),
  items: z
    .array(
      z.object({
        description: z.string().min(3, {
          message: "Description must be at least 3 characters",
        }),
        quantity: z.string().refine((val) => !isNaN(Number.parseInt(val)) && Number.parseInt(val) > 0, {
          message: "Quantity must be a positive number",
        }),
        unitPrice: z.string().refine((val) => !isNaN(Number.parseFloat(val)) && Number.parseFloat(val) > 0, {
          message: "Unit price must be a positive number",
        }),
      }),
    )
    .min(1, {
      message: "At least one item is required",
    }),
})

export default function RequisitionRequestPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      department: "",
      totalAmount: "",
      purpose: "",
      items: [{ description: "", quantity: "1", unitPrice: "" }],
    },
  })

  const { fields, append, remove } = form.control._fields.items
    ? form.control._fields.items
    : { fields: [{ id: "0" }], append: () => {}, remove: () => {} }

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    // In a real app, this would submit to an API
    console.log(values)

    // Simulate API call
    setTimeout(() => {
      // this would submit to an API
      console.log(values)

      // Simulate API call
      setIsSubmitting(false)
      router.push("/dashboard?success=true")
    }, 1500)
  }

  // Calculate total amount based on items
  const calculateTotal = () => {
    const items = form.getValues("items")
    if (!items) return "0.00"

    const total = items.reduce((sum, item) => {
      const quantity = Number.parseInt(item.quantity) || 0
      const price = Number.parseFloat(item.unitPrice) || 0
      return sum + quantity * price
    }, 0)

    return total.toFixed(2)
  }

  // Update total amount when items change
  const updateTotalAmount = () => {
    const total = calculateTotal()
    form.setValue("totalAmount", total)
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <BackButton />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Imprest Request</CardTitle>
          <CardDescription>Submit a new imprest request for goods or services.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Request Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Brief title for this requisition" {...field} />
                      </FormControl>
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
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="administrative">Administrative and HR</SelectItem>
                          <SelectItem value="monitoring">Monitoring and Evaluation</SelectItem>
                          <SelectItem value="executive">Executive</SelectItem>
                          <SelectItem value="programs">Programs</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="purpose"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purpose</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Explain the purpose of this requisition"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <FormLabel className="text-base">Items</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ description: "", quantity: "1", unitPrice: "" })}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Item
                  </Button>
                </div>

                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-12 gap-4 mb-4 items-start">
                    <div className="col-span-6">
                      <FormField
                        control={form.control}
                        name={`items.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className={index !== 0 ? "sr-only" : ""}>Description</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Item description"
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e)
                                  updateTotalAmount()
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-2">
                      <FormField
                        control={form.control}
                        name={`items.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className={index !== 0 ? "sr-only" : ""}>Qty</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e)
                                  updateTotalAmount()
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-3">
                      <FormField
                        control={form.control}
                        name={`items.${index}.unitPrice`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className={index !== 0 ? "sr-only" : ""}>Unit Price (GHS)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="0.00"
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e)
                                  updateTotalAmount()
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-1 pt-8">
                      {index > 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            remove(index)
                            updateTotalAmount()
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                          <span className="sr-only">Remove item</span>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

                <div className="flex justify-end mt-4">
                  <div className="w-1/3">
                    <FormField
                      control={form.control}
                      name="totalAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total Amount (GHS)</FormLabel>
                          <FormControl>
                            <Input readOnly value={calculateTotal()} {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              <div>
                <FormLabel>Attachments</FormLabel>
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
                    <input id="file-upload" type="file" className="hidden" />
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
