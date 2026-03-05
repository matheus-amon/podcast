'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Invoice, INVOICE_STATUS } from '@/types/billing'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface UseInvoiceColumnsProps {
  onPay?: (invoice: Invoice) => void
  onCancel?: (invoice: Invoice) => void
}

export function useInvoiceColumns({ onPay, onCancel }: UseInvoiceColumnsProps = {}): ColumnDef<Invoice>[] {
  const getStatusVariant = (status: Invoice['status']) => {
    switch (status) {
      case 'PAID':
        return 'success' as const
      case 'PENDING':
        return 'warning' as const
      case 'OVERDUE':
        return 'destructive' as const
      case 'CANCELLED':
        return 'secondary' as const
      default:
        return 'outline' as const
    }
  }

  return [
    {
      accessorKey: 'invoiceNumber',
      header: 'Invoice',
      cell: ({ row }) => {
        const invoice = row.original
        return (
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <div className="font-medium">
                {invoice.invoiceNumber || `#${invoice.id}`}
              </div>
              <div className="text-xs text-muted-foreground">{invoice.clientName}</div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => {
        const amount = row.original.amount
        return (
          <div className="font-medium">
            ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        )
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status
        const statusConfig = INVOICE_STATUS.find((s) => s.id === status)
        return (
          <Badge variant={getStatusVariant(status)}>
            <div className="flex items-center gap-1">
              <div className={`h-2 w-2 rounded-full ${statusConfig?.color}`} />
              {statusConfig?.label}
            </div>
          </Badge>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: 'dueDate',
      header: 'Due Date',
      cell: ({ row }) => {
        const date = row.original.dueDate
        const isOverdue = new Date(date) < new Date() && row.original.status !== 'PAID'
        return (
          <div className={isOverdue ? 'text-red-600 font-medium' : ''}>
            {format(new Date(date), 'MMM d, yyyy', { locale: ptBR })}
            {isOverdue && <div className="text-xs">Overdue</div>}
          </div>
        )
      },
    },
    {
      accessorKey: 'subscriptionPlan',
      header: 'Plan',
      cell: ({ row }) => {
        const plan = row.original.subscriptionPlan
        return plan || '-'
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const invoice = row.original
        const isPaid = invoice.status === 'PAID'
        const isCancelled = invoice.status === 'CANCELLED'
        
        return (
          <div className="flex items-center gap-2">
            {!isPaid && !isCancelled && onPay && (
              <Button variant="ghost" size="sm" onClick={() => onPay(invoice)}>
                Pay
              </Button>
            )}
            {!isPaid && !isCancelled && onCancel && (
              <Button variant="ghost" size="sm" onClick={() => onCancel(invoice)}>
                Cancel
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
