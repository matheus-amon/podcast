'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getAgendaEvents,
  createAgendaEvent,
  updateAgendaEvent,
  deleteAgendaEvent,
  cancelAgendaEvent,
  completeAgendaEvent,
} from './use-agenda-api'
import type { CreateAgendaEventDTO, AgendaEvent } from '@/types/agenda'

export function useAgendaEvents() {
  return useQuery({
    queryKey: ['agenda', 'events'],
    queryFn: getAgendaEvents,
  })
}

export function useCreateAgendaEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateAgendaEventDTO) => createAgendaEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agenda', 'events'] })
    },
  })
}

export function useUpdateAgendaEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { id: number } & Partial<CreateAgendaEventDTO>) =>
      updateAgendaEvent(data as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agenda', 'events'] })
    },
  })
}

export function useDeleteAgendaEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deleteAgendaEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agenda', 'events'] })
    },
  })
}

export function useCancelAgendaEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => cancelAgendaEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agenda', 'events'] })
    },
  })
}

export function useCompleteAgendaEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => completeAgendaEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agenda', 'events'] })
    },
  })
}
