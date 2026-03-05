'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Budget, BUDGET_TYPES, BUDGET_STATUS } from '@/types/budget'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MoreHorizontal } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface UseBudgetColumnsProps {
  onEdit?: (budget: Budget) => void
  onDelete?: (budget: Budget) => void
}

export function useBudgetColumns({ onEdit, onDelete }: UseBudgetColumnsProps = {}): ColumnDef<Budget>[] {
  const getTypeVariant = (type: Budget['type']) => {
    return type === 'INCOME' ? 'success' : 'destructive'
  }

  const getStatusVariant = (status: Budget['status']) => {
    switch (status) {
      case 'PAID':
        return 'success' as const
      case 'APPROVED':
        return 'default' as const
      case 'PENDING':
        return 'warning' as const
      case 'PLANNED':
        return 'secondary' as const
      default:
        return 'outline' as const
    }
  }

  return [
    {
      accessorKey: 'concept',
      header: 'Concept',
      cell: ({ row }) => {
        const budget = row.original
        return (
          <div>
            <div className="font-medium">{budget.concept}</div>
            <div className="text-xs text-muted-foreground">{budget.category}</div>
          </div>
        )
      },
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => {
        const amount = row.original.amount
        const type = row.original.type
        return (
          <div className={`font-medium ${type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
            {type === 'INCOME' ? '+' : '-'}${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        )
      },
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => {
        const type = row.original.type
        const typeConfig = BUDGET_TYPES.find((t) => t.id === type)
        return (
          <Badge variant={getTypeVariant(type)}>
            <div className="flex items-center gap-1">
              <div className={`h-2 w-2 rounded-full ${typeConfig?.color}`} />
              {typeConfig?.label}
            </div>
          </Badge>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status
        const statusConfig = BUDGET_STATUS.find((s) => s.id === status)
        return (
          <Badge variant={getStatusVariant(status)}>
            <div className="flex items-center gap-1">
              <div className={`h-2 w-2 rounded-full ${statusConfig?.color}`} />
              {statusConfig?.label}
            </div>
          </Badge>
        )
      },
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => {
        const date = row.original.date
        return format(new Date(date), 'MMM d, yyyy', { locale: ptBR })
      },
    },
    {
      accessorKey: 'responsible',
      header: 'Responsible',
      cell: ({ row }) => {
        const responsible = row.original.responsible
        return responsible || '-'
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const budget = row.original
        return (
          <div className="flex items-center gap-2">
            {onEdit && (
              <Button variant="ghost" size="sm" onClick={() => onEdit(budget)}>
                Edit
              </Button>
            )}
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        )
      },
    },
  ]
}
