'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getEpisodes,
  createEpisode,
  updateEpisode,
  deleteEpisode,
} from './use-episodes-api'
import type { CreateEpisodeDTO, Episode } from '@/types/episode'

export function useEpisodes() {
  return useQuery({
    queryKey: ['episodes'],
    queryFn: getEpisodes,
  })
}

export function useCreateEpisode() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateEpisodeDTO) => createEpisode(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['episodes'] })
    },
  })
}

export function useUpdateEpisode() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { id: number } & Partial<CreateEpisodeDTO>) =>
      updateEpisode(data as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['episodes'] })
    },
  })
}

export function useDeleteEpisode() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deleteEpisode(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['episodes'] })
    },
  })
}
