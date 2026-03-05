export interface Lead {
  id: number
  name: string
  email: string
  phone?: string | null
  role: 'GUEST' | 'HOST' | 'PRODUCER'
  status: 'PROSPECT' | 'CONTACTED' | 'CONFIRMED' | 'RECORDED'
  company?: string | null
  position?: string | null
  avatarUrl?: string | null
  source?: string
  lastContact?: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateLeadDTO {
  name: string
  email: string
  phone?: string
  role?: 'GUEST' | 'HOST' | 'PRODUCER'
  status?: 'PROSPECT' | 'CONTACTED' | 'CONFIRMED' | 'RECORDED'
  company?: string
  position?: string
  source?: string
}

export interface UpdateLeadDTO extends Partial<CreateLeadDTO> {
  id: number
}

export const LEAD_COLUMNS = [
  { id: 'PROSPECT', title: 'Prospect', color: 'bg-slate-400' },
  { id: 'CONTACTED', title: 'Contacted', color: 'bg-blue-500' },
  { id: 'CONFIRMED', title: 'Confirmed', color: 'bg-green-500' },
  { id: 'RECORDED', title: 'Recorded', color: 'bg-purple-500' },
] as const

export type LeadColumnId = typeof LEAD_COLUMNS[number]['id']
