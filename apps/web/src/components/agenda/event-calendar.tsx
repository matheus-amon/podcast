'use client'

import { Calendar, dateFnsLocalizer, View, SlotInfo } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { AgendaEvent } from '@/types/agenda'
import { useMemo } from 'react'

const locales = {
  'pt-BR': ptBR,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

interface CalendarEvent {
  id: number
  title: string
  start: Date
  end: Date
  description?: string | null
  type?: AgendaEvent['type']
  status?: AgendaEvent['status']
  color?: string | null
  allDay?: boolean
}

interface EventCalendarProps {
  events: AgendaEvent[]
  onView?: (view: View) => void
  onNavigate?: (date: Date) => void
  onSelectEvent?: (event: CalendarEvent, e: any) => void
  onSelectSlot?: (slot: SlotInfo) => void
}

export function EventCalendar({
  events,
  onView,
  onNavigate,
  onSelectEvent,
  onSelectSlot,
}: EventCalendarProps) {
  // Transform API events to Calendar format
  const calendarEvents = useMemo<CalendarEvent[]>(() => {
    return events.map((event) => ({
      id: event.id,
      title: event.title,
      start: new Date(event.startAt),
      end: new Date(event.endAt),
      description: event.description,
      type: event.type,
      status: event.status,
      color: event.color,
      allDay: false,
    }))
  }, [events])

  const eventStyleGetter = (event: CalendarEvent) => {
    const backgroundColor = event.color || '#3B82F6'
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0',
        display: 'block',
      },
    }
  }

  return (
    <div className="h-[calc(100vh-12rem)]">
      <Calendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        views={['month', 'week', 'day', 'agenda']}
        defaultView="month"
        step={60}
        showMultiDayTimes
        selectable
        onView={onView}
        onNavigate={onNavigate}
        onSelectEvent={onSelectEvent}
        onSelectSlot={onSelectSlot}
        eventPropGetter={eventStyleGetter}
        messages={{
          date: 'Data',
          time: 'Hora',
          event: 'Evento',
          allDay: 'Dia inteiro',
          week: 'Semana',
          day: 'Dia',
          month: 'Mês',
          agenda: 'Agenda',
          today: 'Hoje',
          tomorrow: 'Amanhã',
          yesterday: 'Ontem',
          previous: 'Anterior',
          next: 'Próximo',
          noEventsInRange: 'Não há eventos neste período.',
          showMore: (count: number) => `+ ${count} mais`,
        }}
        className="h-full"
      />
    </div>
  )
}
