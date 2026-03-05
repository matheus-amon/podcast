import { fetchAPI } from "@/lib/api"
import type { Budget, CreateBudgetDTO, UpdateBudgetDTO, BudgetSummary } from "@/types/budget"

export async function getBudgets(): Promise<Budget[]> {
  return fetchAPI('/api/budget')
}

export async function getBudgetSummary(): Promise<BudgetSummary> {
  return fetchAPI('/api/budget/summary')
}

export async function createBudget(data: CreateBudgetDTO): Promise<Budget> {
  return fetchAPI('/api/budget', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateBudget(data: UpdateBudgetDTO): Promise<Budget> {
  return fetchAPI(`/api/budget/${data.id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function deleteBudget(id: number): Promise<void> {
  return fetchAPI(`/api/budget/${id}`, {
    method: 'DELETE',
  })
}
