export interface AgendaEvent {
  id: number
  title: string
  description?: string | null
  startAt: string
  endAt: string
  type: 'RECORDING' | 'RELEASE' | 'MEETING' | 'OTHER'
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  leadId?: number | null
  episodeId?: number | null
  participants?: string[] | null
  color?: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateAgendaEventDTO {
  title: string
  description?: string
  startAt: string
  endAt: string
  type?: 'RECORDING' | 'RELEASE' | 'MEETING' | 'OTHER'
  status?: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  leadId?: number
  episodeId?: number
  participants?: string[]
  color?: string
}

export interface UpdateAgendaEventDTO extends Partial<CreateAgendaEventDTO> {
  id: number
}

export const EVENT_TYPES = [
  { id: 'RECORDING', label: 'Recording', color: 'bg-blue-500' },
  { id: 'RELEASE', label: 'Release', color: 'bg-green-500' },
  { id: 'MEETING', label: 'Meeting', color: 'bg-purple-500' },
  { id: 'OTHER', label: 'Other', color: 'bg-slate-500' },
] as const

export const EVENT_STATUS = [
  { id: 'SCHEDULED', label: 'Scheduled', color: 'bg-blue-400' },
  { id: 'IN_PROGRESS', label: 'In Progress', color: 'bg-yellow-400' },
  { id: 'COMPLETED', label: 'Completed', color: 'bg-green-500' },
  { id: 'CANCELLED', label: 'Cancelled', color: 'bg-red-400' },
] as const

export type EventType = typeof EVENT_TYPES[number]['id']
export type EventStatus = typeof EVENT_STATUS[number]['id']
