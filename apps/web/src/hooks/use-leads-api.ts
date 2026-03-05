import { fetchAPI } from "@/lib/api"
import type { Lead, CreateLeadDTO, UpdateLeadDTO } from "@/types/lead"

export async function getLeads(): Promise<Lead[]> {
  return fetchAPI('/api/leads')
}

export async function getLeadById(id: number): Promise<Lead> {
  return fetchAPI(`/api/leads/${id}`)
}

export async function createLead(data: CreateLeadDTO): Promise<Lead> {
  return fetchAPI('/api/leads', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateLead(data: UpdateLeadDTO): Promise<Lead> {
  return fetchAPI(`/api/leads/${data.id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function deleteLead(id: number): Promise<void> {
  return fetchAPI(`/api/leads/${id}`, {
    method: 'DELETE',
  })
}

export async function updateLeadStatus(id: number, status: Lead['status']): Promise<Lead> {
  return updateLead({ id, status })
}
