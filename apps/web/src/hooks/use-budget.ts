'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getBudgets,
  getBudgetSummary,
  createBudget,
  updateBudget,
  deleteBudget,
} from './use-budget-api'
import type { CreateBudgetDTO } from '@/types/budget'

export function useBudgets() {
  return useQuery({
    queryKey: ['budget'],
    queryFn: getBudgets,
  })
}

export function useBudgetSummary() {
  return useQuery({
    queryKey: ['budget', 'summary'],
    queryFn: getBudgetSummary,
  })
}

export function useCreateBudget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateBudgetDTO) => createBudget(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget'] })
      queryClient.invalidateQueries({ queryKey: ['budget', 'summary'] })
    },
  })
}

export function useUpdateBudget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { id: number } & Partial<CreateBudgetDTO>) =>
      updateBudget(data as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget'] })
      queryClient.invalidateQueries({ queryKey: ['budget', 'summary'] })
    },
  })
}

export function useDeleteBudget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deleteBudget(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget'] })
      queryClient.invalidateQueries({ queryKey: ['budget', 'summary'] })
    },
  })
}
