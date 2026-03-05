'use client'

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCreateBudget, useUpdateBudget } from "@/hooks/use-budget"
import { Budget, BUDGET_TYPES, BUDGET_STATUS } from "@/types/budget"

const budgetSchema = z.object({
  concept: z.string().min(2, "Concept must be at least 2 characters"),
  amount: z.number().min(0.01, "Amount must be greater than zero"),
  type: z.enum(["INCOME", "EXPENSE"]),
  category: z.string().min(1, "Category is required"),
  date: z.string().optional().nullable(),
  responsible: z.string().optional().nullable(),
  status: z.enum(["PLANNED", "APPROVED", "PAID", "PENDING"]),
  connectedEpisodeId: z.number().optional(),
})

type BudgetFormValues = z.infer<typeof budgetSchema>

interface BudgetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  budget?: Budget | null
}

const defaultValues: BudgetFormValues = {
  concept: "",
  amount: 0,
  type: "EXPENSE",
  category: "",
  date: null,
  responsible: null,
  status: "PENDING",
  connectedEpisodeId: undefined,
}

export function BudgetDialog({ open, onOpenChange, budget }: BudgetDialogProps) {
  const createBudget = useCreateBudget()
  const updateBudget = useUpdateBudget()

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues,
    values: budget ? {
      concept: budget.concept,
      amount: budget.amount,
      type: budget.type,
      category: budget.category,
      date: budget.date ?? null,
      responsible: budget.responsible ?? null,
      status: budget.status,
      connectedEpisodeId: budget.connectedEpisodeId ?? undefined,
    } : defaultValues,
  })

  const onSubmit = async (data: BudgetFormValues) => {
    try {
      const cleanData: any = {
        ...Object.fromEntries(
          Object.entries(data).filter(([_, v]) => v != null && v !== '')
        ),
      }

      if (budget) {
        await updateBudget.mutateAsync({ id: budget.id, ...cleanData })
      } else {
        await createBudget.mutateAsync(cleanData)
      }
      
      form.reset()
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to save budget:", error)
    }
  }

  const isEditing = !!budget

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Budget' : 'Add New Budget'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update budget details.'
              : 'Create a new budget item.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            {/* Concept */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="concept" className="text-right">Concept</Label>
              <Input
                id="concept"
                className="col-span-3"
                {...form.register("concept")}
              />
            </div>
            {form.formState.errors.concept && (
              <p className="text-sm text-destructive col-span-4 col-start-2">
                {form.formState.errors.concept.message}
              </p>
            )}

            {/* Amount */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                className="col-span-3"
                {...form.register("amount", { valueAsNumber: true })}
              />
            </div>
            {form.formState.errors.amount && (
              <p className="text-sm text-destructive col-span-4 col-start-2">
                {form.formState.errors.amount.message}
              </p>
            )}

            {/* Type */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">Type</Label>
              <Select
                onValueChange={(value) => form.setValue("type", value as any)}
                defaultValue={form.getValues("type")}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {BUDGET_TYPES.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${type.color}`} />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">Category</Label>
              <Input
                id="category"
                className="col-span-3"
                {...form.register("category")}
              />
            </div>

            {/* Date */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">Date</Label>
              <Input
                id="date"
                type="date"
                className="col-span-3"
                {...form.register("date")}
              />
            </div>

            {/* Responsible */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="responsible" className="text-right">Responsible</Label>
              <Input
                id="responsible"
                className="col-span-3"
                {...form.register("responsible")}
              />
            </div>

            {/* Status */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">Status</Label>
              <Select
                onValueChange={(value) => form.setValue("status", value as any)}
                defaultValue={form.getValues("status")}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {BUDGET_STATUS.map((status) => (
                    <SelectItem key={status.id} value={status.id}>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${status.color}`} />
                        {status.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createBudget.isPending || updateBudget.isPending}>
              {(createBudget.isPending || updateBudget.isPending) ? "Saving..." : (isEditing ? "Update" : "Create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
