/**
 * Get Budget Summary Use Case
 *
 * Caso de uso para obter resumo financeiro dos budgets
 */

import type { IBudgetRepository, BudgetFilters, BudgetSummary } from '@domain/budget/ports/budget-repository.port';
import type { BudgetType } from '@domain/budget/value-objects/budget-type.enum';
import type { BudgetStatus } from '@domain/budget/value-objects/budget-status.enum';

export interface GetBudgetSummaryUseCaseInput {
  type?: BudgetType;
  status?: BudgetStatus;
  category?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export type GetBudgetSummaryUseCaseOutput = BudgetSummary;

export class GetBudgetSummaryUseCase {
  constructor(private readonly budgetRepository: IBudgetRepository) {}

  async execute(input: GetBudgetSummaryUseCaseInput = {}): Promise<GetBudgetSummaryUseCaseOutput> {
    const filters: BudgetFilters = {
      type: input.type,
      status: input.status,
      category: input.category,
      dateFrom: input.dateFrom,
      dateTo: input.dateTo,
    };

    const summary = await this.budgetRepository.findSummary(filters);

    return summary;
  }
}
