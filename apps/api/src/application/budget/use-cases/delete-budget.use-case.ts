/**
 * Delete Budget Use Case
 *
 * Caso de uso para deletar (soft delete) um budget
 */

import type { IBudgetRepository } from '@domain/budget/ports/budget-repository.port';

export interface DeleteBudgetUseCaseInput {
  id: string;
}

export type DeleteBudgetUseCaseOutput = void;

export class DeleteBudgetUseCase {
  constructor(private readonly budgetRepository: IBudgetRepository) {}

  async execute(input: DeleteBudgetUseCaseInput): Promise<DeleteBudgetUseCaseOutput> {
    const budget = await this.budgetRepository.findById(input.id);

    if (!budget) {
      throw new Error('Budget not found');
    }

    // Verificar se já está deletado
    if (budget.isDeleted()) {
      throw new Error('Budget is already deleted');
    }

    // Realizar soft delete
    budget.delete();

    // Persistir
    await this.budgetRepository.update(budget);
  }
}
