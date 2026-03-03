/**
 * Budget Module Composition Root
 *
 * Configura injeção de dependência para o módulo Budget
 * Este é o ponto de composição do módulo
 */

import { PostgresBudgetRepository } from '@infrastructure/database/adapters/budget-repository.adapter';
import { BudgetController } from '@infrastructure/http/adapters/budget.controller';
import { CreateBudgetUseCase } from '@application/budget/use-cases/create-budget.use-case';
import { UpdateBudgetUseCase } from '@application/budget/use-cases/update-budget.use-case';
import { DeleteBudgetUseCase } from '@application/budget/use-cases/delete-budget.use-case';
import { ListBudgetsUseCase } from '@application/budget/use-cases/list-budgets.use-case';
import { GetBudgetUseCase } from '@application/budget/use-cases/get-budget.use-case';
import { GetBudgetSummaryUseCase } from '@application/budget/use-cases/get-budget-summary.use-case';
import { CreateBudgetTemplateUseCase } from '@application/budget/use-cases/create-budget-template.use-case';
import { ListBudgetTemplatesUseCase } from '@application/budget/use-cases/list-budget-templates.use-case';
import { ApplyBudgetTemplateUseCase } from '@application/budget/use-cases/apply-budget-template.use-case';

/**
 * Cria e configura todas as dependências do módulo Budget
 */
export function createBudgetModule(): BudgetController {
  // Infrastructure layer (repository adapter)
  const budgetRepository = new PostgresBudgetRepository();

  // Application layer (use cases)
  const createBudgetUseCase = new CreateBudgetUseCase(budgetRepository);
  const updateBudgetUseCase = new UpdateBudgetUseCase(budgetRepository);
  const deleteBudgetUseCase = new DeleteBudgetUseCase(budgetRepository);
  const listBudgetsUseCase = new ListBudgetsUseCase(budgetRepository);
  const getBudgetUseCase = new GetBudgetUseCase(budgetRepository);
  const getBudgetSummaryUseCase = new GetBudgetSummaryUseCase(budgetRepository);
  const createBudgetTemplateUseCase = new CreateBudgetTemplateUseCase(budgetRepository);
  const listBudgetTemplatesUseCase = new ListBudgetTemplatesUseCase(budgetRepository);
  const applyBudgetTemplateUseCase = new ApplyBudgetTemplateUseCase(budgetRepository);

  // Infrastructure layer (HTTP controller)
  const budgetController = new BudgetController(
    createBudgetUseCase,
    updateBudgetUseCase,
    deleteBudgetUseCase,
    listBudgetsUseCase,
    getBudgetUseCase,
    getBudgetSummaryUseCase,
    createBudgetTemplateUseCase,
    listBudgetTemplatesUseCase,
    applyBudgetTemplateUseCase
  );

  return budgetController;
}
