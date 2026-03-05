import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useBudgetColumns } from '@/components/budget/budget-columns'
import type { Budget } from '@/types/budget'

const mockBudgets: Budget[] = [
  {
    id: 1,
    concept: 'Equipment',
    amount: 1000,
    type: 'EXPENSE',
    category: 'Production',
    date: new Date().toISOString(),
    responsible: 'John',
    status: 'APPROVED',
    connectedEpisodeId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  },
  {
    id: 2,
    concept: 'Sponsorship',
    amount: 2000,
    type: 'INCOME',
    category: 'Revenue',
    date: new Date().toISOString(),
    responsible: 'Jane',
    status: 'PAID',
    connectedEpisodeId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  },
]

describe('useBudgetColumns', () => {
  it('should return columns array', () => {
    const { result } = renderHook(() => useBudgetColumns())

    expect(result.current).toBeInstanceOf(Array)
    expect(result.current.length).toBeGreaterThan(0)
  })

  it('should have concept column', () => {
    const { result } = renderHook(() => useBudgetColumns())

    const conceptColumn = result.current.find(col => col.accessorKey === 'concept')
    expect(conceptColumn).toBeDefined()
  })

  it('should have amount column', () => {
    const { result } = renderHook(() => useBudgetColumns())

    const amountColumn = result.current.find(col => col.accessorKey === 'amount')
    expect(amountColumn).toBeDefined()
  })

  it('should have type column', () => {
    const { result } = renderHook(() => useBudgetColumns())

    const typeColumn = result.current.find(col => col.accessorKey === 'type')
    expect(typeColumn).toBeDefined()
  })

  it('should have status column', () => {
    const { result } = renderHook(() => useBudgetColumns())

    const statusColumn = result.current.find(col => col.accessorKey === 'status')
    expect(statusColumn).toBeDefined()
  })

  it('should differentiate INCOME and EXPENSE types', () => {
    const { result } = renderHook(() => useBudgetColumns())

    const typeColumn = result.current.find(col => col.accessorKey === 'type')
    expect(typeColumn).toBeDefined()
    expect(typeColumn?.accessorKey).toBe('type')
  })
})
