'use client'

import { useState } from "react"
import { BudgetKPICards } from "@/components/budget/budget-kpi-cards"
import { BudgetDialog } from "@/components/budget/budget-dialog"
import { DataTable } from "@/components/episodes/episode-table"
import { useBudgetColumns } from "@/components/budget/budget-columns"
import { PageHeader } from "@/components/dashboard/page-header"
import { Button } from "@/components/ui/button"
import { useBudgets, useDeleteBudget } from "@/hooks/use-budget"
import { Budget } from "@/types/budget"
import { Plus } from "lucide-react"

export default function BudgetPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null)

  const { data: budgets = [], isLoading, error } = useBudgets()
  const deleteBudget = useDeleteBudget()

  const columns = useBudgetColumns({
    onEdit: (budget) => {
      setSelectedBudget(budget)
      setDialogOpen(true)
    },
  })

  const handleDelete = async (budget: Budget) => {
    if (confirm(`Are you sure you want to delete "${budget.concept}"?`)) {
      await deleteBudget.mutateAsync(budget.id)
    }
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Failed to load budgets</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Budget"
        description="Manage your podcast budget and finances."
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Budget
          </Button>
        }
      />

      {/* KPI Cards */}
      <BudgetKPICards />

      {/* Budget Table */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
            <p className="text-muted-foreground">Loading budgets...</p>
          </div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={budgets}
          searchKey="concept"
          searchPlaceholder="Search budgets..."
          pageSize={10}
        />
      )}

      <BudgetDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        budget={selectedBudget}
      />
    </div>
  )
}
