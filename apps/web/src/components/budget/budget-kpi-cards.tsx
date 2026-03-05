'use client'

import { KPICard } from "@/components/dashboard/kpi-card"
import { useBudgetSummary } from "@/hooks/use-budget"
import { DollarSign, TrendingUp, TrendingDown, Wallet, Loader2 } from "lucide-react"

export function BudgetKPICards() {
  const { data: summary, isLoading, error } = useBudgetSummary()

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
        title="Total Income"
        value={`$${summary.totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
        description="All income sources"
        icon={TrendingUp}
      />
      <KPICard
        title="Total Expenses"
        value={`$${summary.totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
        description="All expenses"
        icon={TrendingDown}
      />
      <KPICard
        title="Balance"
        value={`$${summary.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
        description={summary.balance >= 0 ? "Positive" : "Negative"}
        icon={Wallet}
      />
      <KPICard
        title="Total Budgets"
        value={summary.count}
        description="Budget items"
        icon={DollarSign}
      />
    </div>
  )
}
