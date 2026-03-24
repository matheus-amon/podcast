/**
 * Apply Budget Template Use Case
 *
 * Caso de uso para aplicar um template, criando múltiplos budget items
 */

import { Budget } from '@domain/budget/entities/budget.entity';
import type { IBudgetRepository } from '@domain/budget/ports/budget-repository.port';
import { BudgetStatus } from '@domain/budget/value-objects/budget-status.enum';

export interface ApplyBudgetTemplateUseCaseInput {
  templateId: string;
  date?: Date;
  status?: BudgetStatus;
}

export interface ApplyBudgetTemplateUseCaseOutput {
  templateName: string;
  appliedCount: number;
  budgets: Budget[];
}

export class ApplyBudgetTemplateUseCase {
  constructor(private readonly budgetRepository: IBudgetRepository) {}

  async execute(input: ApplyBudgetTemplateUseCaseInput): Promise<ApplyBudgetTemplateUseCaseOutput> {
    // Buscar template
    const template = await this.budgetRepository.findTemplateById(input.templateId);

    if (!template) {
      throw new Error('Template not found');
    }

    if (template.items.length === 0) {
      throw new Error('Template has no items to apply');
    }

    // Criar budgets a partir do template
    const applyDate = input.date ?? new Date();
    const applyStatus = input.status ?? BudgetStatus.PLANNED;

    const budgetsToCreate = template.items.map((item) =>
      Budget.create({
        concept: item.concept,
        amount: item.amount,
        type: item.type,
        category: item.category,
        date: applyDate,
        status: applyStatus,
      })
    );

    const appliedBudgets = await this.budgetRepository.createMany(budgetsToCreate);

    return {
      templateName: template.name,
      appliedCount: appliedBudgets.length,
      budgets: appliedBudgets,
    };
  }
}
