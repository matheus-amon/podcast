'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getLeads,
  createLead,
  updateLead,
  deleteLead,
  updateLeadStatus,
} from './use-leads-api'
import type { CreateLeadDTO, Lead } from '@/types/lead'

export function useLeads() {
  return useQuery({
    queryKey: ['leads'],
    queryFn: getLeads,
  })
}

export function useCreateLead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateLeadDTO) => createLead(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
    },
  })
}

export function useUpdateLead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { id: number; status?: Lead['status'] } & Partial<CreateLeadDTO>) =>
      updateLead(data as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
    },
  })
}

export function useDeleteLead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deleteLead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
    },
  })
}

export function useUpdateLeadStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: Lead['status'] }) =>
      updateLeadStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
    },
  })
}
