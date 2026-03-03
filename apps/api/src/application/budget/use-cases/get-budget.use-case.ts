/**
 * Get Budget Use Case
 *
 * Caso de uso para buscar um budget por ID
 */

import type { Budget } from '@domain/budget/entities/budget.entity';
import type { IBudgetRepository } from '@domain/budget/ports/budget-repository.port';

export interface GetBudgetUseCaseInput {
  id: string;
}

export type GetBudgetUseCaseOutput = Budget;

export class GetBudgetUseCase {
  constructor(private readonly budgetRepository: IBudgetRepository) {}

  async execute(input: GetBudgetUseCaseInput): Promise<GetBudgetUseCaseOutput> {
    const budget = await this.budgetRepository.findById(input.id);

    if (!budget) {
      throw new Error('Budget not found');
    }

    // Verificar se está deletado
    if (budget.isDeleted()) {
      throw new Error('Budget has been deleted');
    }

    return budget;
  }
}
