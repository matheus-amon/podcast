'use client'

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCreateInvoice } from "@/hooks/use-billing"
import { Invoice } from "@/types/billing"

const invoiceSchema = z.object({
  clientName: z.string().min(2, "Client name must be at least 2 characters"),
  amount: z.number().min(0.01, "Amount must be greater than zero"),
  dueDate: z.string(),
  invoiceNumber: z.string().optional().nullable(),
  subscriptionPlan: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
})

type InvoiceFormValues = z.infer<typeof invoiceSchema>

interface InvoiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoice?: Invoice | null
}

const defaultValues: InvoiceFormValues = {
  clientName: "",
  amount: 0,
  dueDate: "",
  invoiceNumber: null,
  subscriptionPlan: null,
  description: null,
}

export function InvoiceDialog({ open, onOpenChange, invoice }: InvoiceDialogProps) {
  const createInvoice = useCreateInvoice()

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues,
    values: invoice ? {
      clientName: invoice.clientName,
      amount: invoice.amount,
      dueDate: invoice.dueDate,
      invoiceNumber: invoice.invoiceNumber ?? null,
      subscriptionPlan: invoice.subscriptionPlan ?? null,
      description: invoice.description ?? null,
    } : defaultValues,
  })

  const onSubmit = async (data: InvoiceFormValues) => {
    try {
      const cleanData: any = {
        ...Object.fromEntries(
          Object.entries(data).filter(([_, v]) => v != null && v !== '')
        ),
      }

      await createInvoice.mutateAsync(cleanData)
      
      form.reset()
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to create invoice:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Invoice</DialogTitle>
          <DialogDescription>
            Create a new invoice for your client.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            {/* Client Name */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="clientName" className="text-right">Client Name</Label>
              <Input
                id="clientName"
                className="col-span-3"
                {...form.register("clientName")}
              />
            </div>
            {form.formState.errors.clientName && (
              <p className="text-sm text-destructive col-span-4 col-start-2">
                {form.formState.errors.clientName.message}
              </p>
            )}

            {/* Amount */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                className="col-span-3"
                {...form.register("amount", { valueAsNumber: true })}
              />
            </div>
            {form.formState.errors.amount && (
              <p className="text-sm text-destructive col-span-4 col-start-2">
                {form.formState.errors.amount.message}
              </p>
            )}

            {/* Due Date */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dueDate" className="text-right">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                className="col-span-3"
                {...form.register("dueDate")}
              />
            </div>

            {/* Invoice Number */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="invoiceNumber" className="text-right">Invoice #</Label>
              <Input
                id="invoiceNumber"
                className="col-span-3"
                {...form.register("invoiceNumber")}
              />
            </div>

            {/* Subscription Plan */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="subscriptionPlan" className="text-right">Plan</Label>
              <Select
                onValueChange={(value) => form.setValue("subscriptionPlan", value)}
                defaultValue={form.getValues("subscriptionPlan") || undefined}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BASIC">Basic</SelectItem>
                  <SelectItem value="PRO">Pro</SelectItem>
                  <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">Description</Label>
              <Textarea
                id="description"
                className="col-span-3"
                {...form.register("description")}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createInvoice.isPending}>
              {createInvoice.isPending ? "Creating..." : "Create Invoice"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
