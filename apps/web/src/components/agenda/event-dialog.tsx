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
import { Textarea } from "@/components/ui/textarea"
import { useCreateAgendaEvent } from "@/hooks/use-agenda"
import { AgendaEvent, EVENT_TYPES, EVENT_STATUS } from "@/types/agenda"

const eventSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().optional().nullable(),
  startAt: z.string(),
  endAt: z.string(),
  type: z.enum(["RECORDING", "RELEASE", "MEETING", "OTHER"]),
  status: z.enum(["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
  color: z.string().optional().nullable(),
})

type EventFormValues = z.infer<typeof eventSchema>

interface EventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialDate?: Date
}

const defaultValues: EventFormValues = {
  title: "",
  description: null,
  startAt: "",
  endAt: "",
  type: "MEETING",
  status: "SCHEDULED",
  color: null,
}

export function EventDialog({ open, onOpenChange, initialDate }: EventDialogProps) {
  const createEvent = useCreateAgendaEvent()

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues,
  })

  const onSubmit = async (data: EventFormValues) => {
    try {
      const cleanData: any = {
        ...Object.fromEntries(
          Object.entries(data).filter(([_, v]) => v != null && v !== '')
        ),
      }
      await createEvent.mutateAsync(cleanData)
      form.reset()
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to create event:", error)
    }
  }

  const getTypeColor = (type: string) => {
    const eventType = EVENT_TYPES.find((t) => t.id === type)
    return eventType?.color || '#3B82F6'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Event</DialogTitle>
          <DialogDescription>
            Create a new event in your agenda.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            {/* Title */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">Title</Label>
              <Input
                id="title"
                className="col-span-3"
                {...form.register("title")}
              />
            </div>
            {form.formState.errors.title && (
              <p className="text-sm text-destructive col-span-4 col-start-2">
                {form.formState.errors.title.message}
              </p>
            )}

            {/* Description */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">Description</Label>
              <Textarea
                id="description"
                className="col-span-3"
                {...form.register("description")}
              />
            </div>

            {/* Start Date/Time */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startAt" className="text-right">Start</Label>
              <Input
                id="startAt"
                type="datetime-local"
                className="col-span-3"
                {...form.register("startAt")}
              />
            </div>

            {/* End Date/Time */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endAt" className="text-right">End</Label>
              <Input
                id="endAt"
                type="datetime-local"
                className="col-span-3"
                {...form.register("endAt")}
              />
            </div>

            {/* Type */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">Type</Label>
              <Select
                onValueChange={(value) => {
                  form.setValue("type", value as any)
                  form.setValue("color", getTypeColor(value))
                }}
                defaultValue={form.getValues("type")}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${type.color}`} />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">Status</Label>
              <Select
                onValueChange={(value) => form.setValue("status", value as any)}
                defaultValue={form.getValues("status")}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_STATUS.map((status) => (
                    <SelectItem key={status.id} value={status.id}>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${status.color}`} />
                        {status.label}
                      </div>
                    </SelectItem>
                  ))}
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
            <Button type="submit" disabled={createEvent.isPending}>
              {createEvent.isPending ? "Saving..." : "Save Event"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
