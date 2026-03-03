/**
 * Budget Repository Port
 *
 * Interface que define o contrato para o repositório de Budget
 * Segregação de interface para operações específicas
 */

import type { Budget } from '../entities/budget.entity';
import type { BudgetTemplate } from '../entities/budget-template.entity';
import { BudgetType } from '../value-objects/budget-type.enum';
import { BudgetStatus } from '../value-objects/budget-status.enum';

/**
 * Filtros para busca de budgets
 */
export interface BudgetFilters {
  type?: BudgetType;
  status?: BudgetStatus;
  category?: string;
  dateFrom?: Date;
  dateTo?: Date;
  connectedEpisodeId?: number;
  offset?: number;
  limit?: number;
}

/**
 * Resultado paginado
 */
export interface PaginatedBudgetResult {
  data: Budget[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Resumo financeiro
 */
export interface BudgetSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  count: number;
}

/**
 * Budget Repository Port
 *
 * Define as operações necessárias para persistência de Budget
 */
export interface IBudgetRepository {
  // CRUD básico
  findById(id: string): Promise<Budget | null>;
  findAll(filters?: BudgetFilters): Promise<Budget[]>;
  findPaginated(filters?: BudgetFilters & { page?: number; limit?: number }): Promise<PaginatedBudgetResult>;
  create(budget: Budget): Promise<Budget>;
  update(budget: Budget): Promise<Budget>;
  delete(id: string): Promise<void>;

  // Queries específicas
  findByType(type: BudgetType): Promise<Budget[]>;
  findByStatus(status: BudgetStatus): Promise<Budget[]>;
  findByCategory(category: string): Promise<Budget[]>;
  findByEpisodeId(episodeId: number): Promise<Budget[]>;
  findSummary(filters?: BudgetFilters): Promise<BudgetSummary>;

  // Budget Templates
  findTemplateById(id: string): Promise<BudgetTemplate | null>;
  findAllTemplates(): Promise<BudgetTemplate[]>;
  createTemplate(template: BudgetTemplate): Promise<BudgetTemplate>;
}
