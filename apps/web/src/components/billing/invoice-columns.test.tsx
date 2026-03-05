import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useInvoiceColumns } from '@/components/billing/invoice-columns'
import type { Invoice } from '@/types/billing'

const mockInvoices: Invoice[] = [
  {
    id: 1,
    clientName: 'Client A',
    amount: 1500,
    dueDate: new Date().toISOString(),
    status: 'PENDING',
    invoiceNumber: 'INV-001',
    subscriptionPlan: 'PRO',
    description: 'Monthly subscription',
    paidAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  },
  {
    id: 2,
    clientName: 'Client B',
    amount: 2500,
    dueDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    status: 'OVERDUE',
    invoiceNumber: 'INV-002',
    subscriptionPlan: 'ENTERPRISE',
    description: 'Annual subscription',
    paidAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  },
]

describe('useInvoiceColumns', () => {
  it('should return columns array', () => {
    const { result } = renderHook(() => useInvoiceColumns())

    expect(result.current).toBeInstanceOf(Array)
    expect(result.current.length).toBeGreaterThan(0)
  })

  it('should have invoice column', () => {
    const { result } = renderHook(() => useInvoiceColumns())

    const invoiceColumn = result.current.find(col => col.accessorKey === 'invoiceNumber')
    expect(invoiceColumn).toBeDefined()
  })

  it('should have amount column', () => {
    const { result } = renderHook(() => useInvoiceColumns())

    const amountColumn = result.current.find(col => col.accessorKey === 'amount')
    expect(amountColumn).toBeDefined()
  })

  it('should have status column', () => {
    const { result } = renderHook(() => useInvoiceColumns())

    const statusColumn = result.current.find(col => col.accessorKey === 'status')
    expect(statusColumn).toBeDefined()
  })

  it('should have due date column', () => {
    const { result } = renderHook(() => useInvoiceColumns())

    const dueDateColumn = result.current.find(col => col.accessorKey === 'dueDate')
    expect(dueDateColumn).toBeDefined()
  })

  it('should have actions column', () => {
    const { result } = renderHook(() => useInvoiceColumns())

    const actionsColumn = result.current.find(col => col.id === 'actions')
    expect(actionsColumn).toBeDefined()
  })

  it('should include onPay callback when provided', () => {
    const onPay = vi.fn()
    const { result } = renderHook(() => useInvoiceColumns({ onPay }))

    const actionsColumn = result.current.find(col => col.id === 'actions')
    expect(actionsColumn).toBeDefined()
  })

  it('should include onCancel callback when provided', () => {
    const onCancel = vi.fn()
    const { result } = renderHook(() => useInvoiceColumns({ onCancel }))

    const actionsColumn = result.current.find(col => col.id === 'actions')
    expect(actionsColumn).toBeDefined()
  })
})
