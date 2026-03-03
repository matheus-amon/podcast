/**
 * List Budgets Use Case
 *
 * Caso de uso para listar budgets com paginação e filtros
 */

import type { IBudgetRepository, BudgetFilters, PaginatedBudgetResult } from '@domain/budget/ports/budget-repository.port';
import type { BudgetType } from '@domain/budget/value-objects/budget-type.enum';
import type { BudgetStatus } from '@domain/budget/value-objects/budget-status.enum';

export interface ListBudgetsUseCaseInput {
  page?: number;
  limit?: number;
  type?: BudgetType;
  status?: BudgetStatus;
  category?: string;
  dateFrom?: Date;
  dateTo?: Date;
  connectedEpisodeId?: number;
}

export type ListBudgetsUseCaseOutput = PaginatedBudgetResult;

export class ListBudgetsUseCase {
  constructor(private readonly budgetRepository: IBudgetRepository) {}

  async execute(input: ListBudgetsUseCaseInput = {}): Promise<ListBudgetsUseCaseOutput> {
    const filters: BudgetFilters & { page?: number; limit?: number } = {
      page: input.page ?? 1,
      limit: input.limit ?? 10,
      type: input.type,
      status: input.status,
      category: input.category,
      dateFrom: input.dateFrom,
      dateTo: input.dateTo,
      connectedEpisodeId: input.connectedEpisodeId,
    };

    const result = await this.budgetRepository.findPaginated(filters);

    return result;
  }
}
