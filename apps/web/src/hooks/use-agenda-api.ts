import { fetchAPI } from "@/lib/api"
import type { AgendaEvent, CreateAgendaEventDTO, UpdateAgendaEventDTO } from "@/types/agenda"

export async function getAgendaEvents(): Promise<AgendaEvent[]> {
  return fetchAPI('/api/agenda/events')
}

export async function getAgendaEventById(id: number): Promise<AgendaEvent> {
  return fetchAPI(`/api/agenda/events/${id}`)
}

export async function createAgendaEvent(data: CreateAgendaEventDTO): Promise<AgendaEvent> {
  return fetchAPI('/api/agenda/events', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateAgendaEvent(data: UpdateAgendaEventDTO): Promise<AgendaEvent> {
  return fetchAPI(`/api/agenda/events/${data.id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function deleteAgendaEvent(id: number): Promise<void> {
  return fetchAPI(`/api/agenda/events/${id}`, {
    method: 'DELETE',
  })
}

export async function cancelAgendaEvent(id: number): Promise<AgendaEvent> {
  return fetchAPI(`/api/agenda/events/${id}/cancel`, {
    method: 'POST',
  })
}

export async function completeAgendaEvent(id: number): Promise<AgendaEvent> {
  return fetchAPI(`/api/agenda/events/${id}/complete`, {
    method: 'POST',
  })
}
