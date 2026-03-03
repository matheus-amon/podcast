/**
 * Update Budget Use Case
 *
 * Caso de uso para atualizar um budget existente
 */

import type { Budget } from '@domain/budget/entities/budget.entity';
import type { IBudgetRepository } from '@domain/budget/ports/budget-repository.port';
import { BudgetType } from '@domain/budget/value-objects/budget-type.enum';
import { BudgetStatus } from '@domain/budget/value-objects/budget-status.enum';

export interface UpdateBudgetUseCaseInput {
  id: string;
  concept?: string;
  amount?: number;
  type?: BudgetType;
  category?: string;
  date?: Date;
  responsible?: string;
  status?: BudgetStatus;
  connectedEpisodeId?: number;
}

export type UpdateBudgetUseCaseOutput = Budget;

export class UpdateBudgetUseCase {
  constructor(private readonly budgetRepository: IBudgetRepository) {}

  async execute(input: UpdateBudgetUseCaseInput): Promise<UpdateBudgetUseCaseOutput> {
    // Buscar budget existente
    const budget = await this.budgetRepository.findById(input.id);

    if (!budget) {
      throw new Error('Budget not found');
    }

    // Atualizar campos usando métodos da entity
    if (input.concept !== undefined) {
      budget.updateConcept(input.concept);
    }

    if (input.amount !== undefined) {
      budget.updateAmount(input.amount);
    }

    if (input.type !== undefined) {
      // Type não tem método setter específico, precisamos atualizar via props
      // Para isso, vamos adicionar um método na entity
      (budget as any).props.type = input.type;
      budget.touch();
    }

    if (input.category !== undefined) {
      budget.updateCategory(input.category);
    }

    if (input.date !== undefined) {
      budget.updateDate(input.date);
    }

    if (input.responsible !== undefined) {
      budget.updateResponsible(input.responsible);
    }

    if (input.status !== undefined) {
      // Status tem métodos específicos na entity
      if (input.status === BudgetStatus.APPROVED) {
        budget.approve();
      } else if (input.status === BudgetStatus.PAID) {
        budget.markAsPaid();
      } else if (input.status === BudgetStatus.PENDING) {
        budget.markAsPending();
      } else if (input.status === BudgetStatus.PLANNED) {
        (budget as any).props.status = BudgetStatus.PLANNED;
        budget.touch();
      }
    }

    if (input.connectedEpisodeId !== undefined) {
      budget.connectToEpisode(input.connectedEpisodeId);
    }

    // Persistir
    const updated = await this.budgetRepository.update(budget);

    return updated;
  }
}
