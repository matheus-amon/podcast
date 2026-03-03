/**
 * Create Budget Use Case
 *
 * Caso de uso para criar um novo budget
 */

import { Budget } from '@domain/budget/entities/budget.entity';
import type { IBudgetRepository } from '@domain/budget/ports/budget-repository.port';
import type { CreateBudgetDTO } from '@domain/budget/entities/budget.entity';

export interface CreateBudgetUseCaseInput extends CreateBudgetDTO {}

export type CreateBudgetUseCaseOutput = Budget;

export class CreateBudgetUseCase {
  constructor(private readonly budgetRepository: IBudgetRepository) {}

  async execute(input: CreateBudgetUseCaseInput): Promise<CreateBudgetUseCaseOutput> {
    // Criar entity usando factory method
    const budget = Budget.create({
      concept: input.concept,
      amount: input.amount,
      type: input.type,
      category: input.category,
      date: input.date,
      responsible: input.responsible,
      status: input.status,
      connectedEpisodeId: input.connectedEpisodeId,
    });

    // Persistir
    const created = await this.budgetRepository.create(budget);

    return created;
  }
}
