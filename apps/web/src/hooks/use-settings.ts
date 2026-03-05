'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getWhitelabelConfig, updateWhitelabelConfig } from './use-settings-api'
import type { UpdateWhitelabelConfigDTO } from '@/types/settings'

export function useWhitelabelConfig() {
  return useQuery({
    queryKey: ['settings', 'whitelabel'],
    queryFn: getWhitelabelConfig,
  })
}

export function useUpdateWhitelabelConfig() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateWhitelabelConfigDTO) => updateWhitelabelConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'whitelabel'] })
    },
  })
}
