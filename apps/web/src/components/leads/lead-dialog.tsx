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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCreateLead } from "@/hooks/use-leads"
import { Lead } from "@/types/lead"

const leadSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional().nullable(),
  role: z.enum(["GUEST", "HOST", "PRODUCER"]),
  status: z.enum(["PROSPECT", "CONTACTED", "CONFIRMED", "RECORDED"]),
  company: z.string().optional().nullable(),
  position: z.string().optional().nullable(),
  source: z.string().optional().nullable(),
})

type LeadFormValues = z.infer<typeof leadSchema>

interface LeadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultStatus?: Lead["status"]
}

const defaultValues: LeadFormValues = {
  name: "",
  email: "",
  phone: null,
  role: "GUEST",
  status: "PROSPECT",
  company: null,
  position: null,
  source: null,
}

export function LeadDialog({ open, onOpenChange, defaultStatus }: LeadDialogProps) {
  const createLead = useCreateLead()

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues,
  })

  const onSubmit = async (data: LeadFormValues) => {
    try {
      // Filter out null values
      const cleanData: any = {
        ...Object.fromEntries(
          Object.entries(data).filter(([_, v]) => v != null && v !== '')
        ),
        status: defaultStatus || data.status,
      }
      await createLead.mutateAsync(cleanData)
      form.reset()
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to create lead:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Lead</DialogTitle>
          <DialogDescription>
            Add a new potential guest to your CRM.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            {/* Name */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input
                id="name"
                className="col-span-3"
                {...form.register("name")}
              />
            </div>
            {form.formState.errors.name && (
              <p className="text-sm text-destructive col-span-4 col-start-2">
                {form.formState.errors.name.message}
              </p>
            )}

            {/* Email */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">Email</Label>
              <Input
                id="email"
                type="email"
                className="col-span-3"
                {...form.register("email")}
              />
            </div>
            {form.formState.errors.email && (
              <p className="text-sm text-destructive col-span-4 col-start-2">
                {form.formState.errors.email.message}
              </p>
            )}

            {/* Phone */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">Phone</Label>
              <Input
                id="phone"
                className="col-span-3"
                {...form.register("phone")}
              />
            </div>

            {/* Company */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="company" className="text-right">Company</Label>
              <Input
                id="company"
                className="col-span-3"
                {...form.register("company")}
              />
            </div>

            {/* Position */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="position" className="text-right">Position</Label>
              <Input
                id="position"
                className="col-span-3"
                {...form.register("position")}
              />
            </div>

            {/* Role */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">Role</Label>
              <Select
                onValueChange={(value) => form.setValue("role", value as any)}
                defaultValue={form.getValues("role")}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GUEST">Guest</SelectItem>
                  <SelectItem value="HOST">Host</SelectItem>
                  <SelectItem value="PRODUCER">Producer</SelectItem>
                </SelectContent>
              </Select>
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
            <Button type="submit" disabled={createLead.isPending}>
              {createLead.isPending ? "Saving..." : "Save Lead"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
