export interface Budget {
  id: number
  concept: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  category: string
  date: string
  responsible?: string | null
  status: 'PLANNED' | 'APPROVED' | 'PAID' | 'PENDING'
  connectedEpisodeId?: number | null
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export interface CreateBudgetDTO {
  concept: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  category: string
  date?: string
  responsible?: string
  status?: 'PLANNED' | 'APPROVED' | 'PAID' | 'PENDING'
  connectedEpisodeId?: number
}

export interface UpdateBudgetDTO extends Partial<CreateBudgetDTO> {
  id: number
}

export interface BudgetSummary {
  totalIncome: number
  totalExpense: number
  balance: number
  count: number
}

export const BUDGET_TYPES = [
  { id: 'INCOME', label: 'Income', color: 'bg-green-500' },
  { id: 'EXPENSE', label: 'Expense', color: 'bg-red-500' },
] as const

export const BUDGET_STATUS = [
  { id: 'PLANNED', label: 'Planned', color: 'bg-slate-400' },
  { id: 'PENDING', label: 'Pending', color: 'bg-yellow-400' },
  { id: 'APPROVED', label: 'Approved', color: 'bg-blue-500' },
  { id: 'PAID', label: 'Paid', color: 'bg-green-500' },
] as const

export type BudgetType = typeof BUDGET_TYPES[number]['id']
export type BudgetStatus = typeof BUDGET_STATUS[number]['id']
