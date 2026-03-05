'use client'

import { KPICard } from "@/components/dashboard/kpi-card"
import { useBillingSummary } from "@/hooks/use-billing"
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, FileText } from "lucide-react"
import { Loader2 } from "lucide-react"

export function BillingKPICards() {
  const { data: summary, isLoading, error } = useBillingSummary()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error || !summary) {
    return null
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KPICard
        title="Total Billed"
        value={`$${summary.totalBilled.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
        description="All invoices"
        icon={FileText}
      />
      <KPICard
        title="Total Paid"
        value={`$${summary.totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
        description="Received payments"
        icon={TrendingUp}
      />
      <KPICard
        title="Total Pending"
        value={`$${summary.totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
        description="Awaiting payment"
        icon={AlertCircle}
      />
      <KPICard
        title="Total Overdue"
        value={`$${summary.totalOverdue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
        description="Past due date"
        icon={TrendingDown}
      />
    </div>
  )
}
