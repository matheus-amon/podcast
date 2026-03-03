/**
 * Create Budget Template Use Case
 *
 * Caso de uso para criar um novo template de budget
 */

import { BudgetTemplate } from '@domain/budget/entities/budget-template.entity';
import type { IBudgetRepository } from '@domain/budget/ports/budget-repository.port';
import type { CreateBudgetTemplateDTO, BudgetTemplateItem } from '@domain/budget/entities/budget-template.entity';

export interface CreateBudgetTemplateUseCaseInput extends CreateBudgetTemplateDTO {}

export type CreateBudgetTemplateUseCaseOutput = BudgetTemplate;

export class CreateBudgetTemplateUseCase {
  constructor(private readonly budgetRepository: IBudgetRepository) {}

  async execute(input: CreateBudgetTemplateUseCaseInput): Promise<CreateBudgetTemplateUseCaseOutput> {
    // Criar entity usando factory method
    const template = BudgetTemplate.create({
      name: input.name,
      items: input.items,
    });

    // Persistir
    const created = await this.budgetRepository.createTemplate(template);

    return created;
  }
}
