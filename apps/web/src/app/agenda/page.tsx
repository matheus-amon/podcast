'use client'

import { useState } from "react"
import { EventCalendar } from "@/components/agenda/event-calendar"
import { EventDialog } from "@/components/agenda/event-dialog"
import { PageHeader } from "@/components/dashboard/page-header"
import { Button } from "@/components/ui/button"
import { useAgendaEvents, useCreateAgendaEvent } from "@/hooks/use-agenda"
import { AgendaEvent } from "@/types/agenda"
import { Plus, Calendar as CalendarIcon } from "lucide-react"
import { SlotInfo, View } from "react-big-calendar"

export default function AgendaPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null)
  const [initialDate, setInitialDate] = useState<Date | undefined>()

  const { data: events = [], isLoading, error } = useAgendaEvents()
  const createEvent = useCreateAgendaEvent()

  const handleSelectSlot = (slot: SlotInfo) => {
    setInitialDate(slot.start)
    setDialogOpen(true)
  }

  const handleSelectEvent = (event: any, e: any) => {
    console.log("Selected event:", event)
    // Could open edit dialog here
  }

  const handleViewChange = (view: View) => {
    console.log("View changed:", view)
  }

  const handleNavigate = (date: Date) => {
    console.log("Navigated to:", date)
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Failed to load events</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <PageHeader
        title="Agenda"
        description="Manage your podcast events and schedule."
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        }
      />

      <div className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
              <p className="text-muted-foreground">Loading events...</p>
            </div>
          </div>
        ) : (
          <EventCalendar
            events={events}
            onView={handleViewChange}
            onNavigate={handleNavigate}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
          />
        )}
      </div>

      <EventDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialDate={initialDate}
      />
    </div>
  )
}
