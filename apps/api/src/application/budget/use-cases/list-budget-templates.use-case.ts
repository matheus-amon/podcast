/**
 * List Budget Templates Use Case
 *
 * Caso de uso para listar todos os templates de budget
 */

import type { BudgetTemplate } from '@domain/budget/entities/budget-template.entity';
import type { IBudgetRepository } from '@domain/budget/ports/budget-repository.port';

export type ListBudgetTemplatesUseCaseOutput = BudgetTemplate[];

export class ListBudgetTemplatesUseCase {
  constructor(private readonly budgetRepository: IBudgetRepository) {}

  async execute(): Promise<ListBudgetTemplatesUseCaseOutput> {
    const templates = await this.budgetRepository.findAllTemplates();
    return templates;
  }
}
