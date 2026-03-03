/**
 * Postgres Budget Repository
 *
 * Implementação do Budget Repository usando PostgreSQL
 */

import { db } from '@db/index';
import { budget, budgetTemplates, type Budget as DbBudget, type BudgetTemplates as DbBudgetTemplate } from '@db/schema';
import { eq, desc, and, gte, lte, sql, sum, type SQL } from 'drizzle-orm';
import type { IBudgetRepository, BudgetFilters, PaginatedBudgetResult, BudgetSummary } from '@domain/budget/ports/budget-repository.port';
import { Budget } from '@domain/budget/entities/budget.entity';
import { BudgetTemplate } from '@domain/budget/entities/budget-template.entity';
import { BudgetType } from '@domain/budget/value-objects/budget-type.enum';
import { BudgetStatus } from '@domain/budget/value-objects/budget-status.enum';

/**
 * Mapper: Database → Domain
 */
function mapDbToDomain(dbBudget: DbBudget): Budget {
  return Budget.fromProps({
    id: dbBudget.id.toString(),
    concept: dbBudget.concept,
    amount: dbBudget.amount,
    type: dbBudget.type as BudgetType,
    category: dbBudget.category,
    date: dbBudget.date ? new Date(dbBudget.date) : new Date(),
    responsible: dbBudget.responsible ?? undefined,
    status: dbBudget.status as BudgetStatus,
    connectedEpisodeId: dbBudget.connectedEpisodeId ?? undefined,
    createdAt: dbBudget.createdAt ? new Date(dbBudget.createdAt) : new Date(),
    updatedAt: dbBudget.updatedAt ? new Date(dbBudget.updatedAt) : new Date(),
    deletedAt: dbBudget.deletedAt ? new Date(dbBudget.deletedAt) : undefined,
  });
}

/**
 * Mapper: Domain → Database
 */
function mapDomainToDb(budgetEntity: Budget): Omit<DbBudget, 'id' | 'createdAt'> {
  return {
    concept: budgetEntity.concept,
    amount: budgetEntity.amount,
    type: budgetEntity.type,
    category: budgetEntity.category,
    date: budgetEntity.date.toISOString().split('T')[0],
    responsible: budgetEntity.responsible ?? null,
    status: budgetEntity.status,
    connectedEpisodeId: budgetEntity.connectedEpisodeId ?? null,
    updatedAt: new Date(),
    deletedAt: budgetEntity.deletedAt ? new Date(budgetEntity.deletedAt) : null,
  };
}

/**
 * Mapper: Database Template → Domain
 */
function mapDbTemplateToDomain(dbTemplate: DbBudgetTemplate): BudgetTemplate {
  return BudgetTemplate.fromProps({
    id: dbTemplate.id.toString(),
    name: dbTemplate.name,
    items: dbTemplate.items ?? [],
    createdAt: dbTemplate.createdAt ? new Date(dbTemplate.createdAt) : new Date(),
    updatedAt: dbTemplate.updatedAt ? new Date(dbTemplate.updatedAt) : new Date(),
  });
}

/**
 * Mapper: Domain Template → Database
 */
function mapDomainTemplateToDb(template: BudgetTemplate): Omit<DbBudgetTemplate, 'id' | 'createdAt'> {
  return {
    name: template.name,
    items: template.items,
    updatedAt: new Date(),
  };
}

export class PostgresBudgetRepository implements IBudgetRepository {
  /**
   * Buscar budget por ID
   */
  async findById(id: string): Promise<Budget | null> {
    const result = await db.query.budget.findFirst({
      where: eq(budget.id, parseInt(id)),
    });

    if (!result) return null;
    return mapDbToDomain(result);
  }

  /**
   * Buscar todos os budgets
   */
  async findAll(filters?: BudgetFilters): Promise<Budget[]> {
    const where = this.buildWhereClause(filters);

    const results = await db
      .select()
      .from(budget)
      .where(where)
      .orderBy(desc(budget.date));

    return results.map(mapDbToDomain);
  }

  /**
   * Buscar budgets com paginação
   */
  async findPaginated(filters?: BudgetFilters & { page?: number; limit?: number }): Promise<PaginatedBudgetResult> {
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 10;
    const offset = (page - 1) * limit;

    const where = this.buildWhereClause(filters);

    // Buscar total
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(budget)
      .where(where);
    const total = Number(totalResult[0]?.count ?? 0);

    // Buscar dados paginados
    const results = await db
      .select()
      .from(budget)
      .where(where)
      .orderBy(desc(budget.date))
      .limit(limit)
      .offset(offset);

    return {
      data: results.map(mapDbToDomain),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Criar novo budget
   */
  async create(budgetEntity: Budget): Promise<Budget> {
    const dbData = mapDomainToDb(budgetEntity);

    const result = await db
      .insert(budget)
      .values(dbData)
      .returning();

    return mapDbToDomain(result[0]);
  }

  /**
   * Atualizar budget
   */
  async update(budgetEntity: Budget): Promise<Budget> {
    const dbData = mapDomainToDb(budgetEntity);

    const result = await db
      .update(budget)
      .set(dbData)
      .where(eq(budget.id, parseInt(budgetEntity.id)))
      .returning();

    if (!result[0]) {
      throw new Error('Budget not found');
    }

    return mapDbToDomain(result[0]);
  }

  /**
   * Deletar budget (soft delete via entity)
   */
  async delete(id: string): Promise<void> {
    await db.delete(budget).where(eq(budget.id, parseInt(id)));
  }

  /**
   * Buscar budgets por tipo
   */
  async findByType(type: BudgetType): Promise<Budget[]> {
    const results = await db
      .select()
      .from(budget)
      .where(eq(budget.type, type))
      .orderBy(desc(budget.date));

    return results.map(mapDbToDomain);
  }

  /**
   * Buscar budgets por status
   */
  async findByStatus(status: BudgetStatus): Promise<Budget[]> {
    const results = await db
      .select()
      .from(budget)
      .where(eq(budget.status, status))
      .orderBy(desc(budget.date));

    return results.map(mapDbToDomain);
  }

  /**
   * Buscar budgets por categoria
   */
  async findByCategory(category: string): Promise<Budget[]> {
    const results = await db
      .select()
      .from(budget)
      .where(eq(budget.category, category))
      .orderBy(desc(budget.date));

    return results.map(mapDbToDomain);
  }

  /**
   * Buscar budgets por episódio
   */
  async findByEpisodeId(episodeId: number): Promise<Budget[]> {
    const results = await db
      .select()
      .from(budget)
      .where(eq(budget.connectedEpisodeId, episodeId))
      .orderBy(desc(budget.date));

    return results.map(mapDbToDomain);
  }

  /**
   * Buscar resumo financeiro
   */
  async findSummary(filters?: BudgetFilters): Promise<BudgetSummary> {
    const where = this.buildWhereClause(filters);

    // Total income
    const incomeResult = await db
      .select({ value: sum(budget.amount) })
      .from(budget)
      .where(where ? and(where, eq(budget.type, 'INCOME')) : eq(budget.type, 'INCOME'));

    // Total expense
    const expenseResult = await db
      .select({ value: sum(budget.amount) })
      .from(budget)
      .where(where ? and(where, eq(budget.type, 'EXPENSE')) : eq(budget.type, 'EXPENSE'));

    // Count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(budget)
      .where(where);

    const totalIncome = Number(incomeResult[0]?.value ?? 0);
    const totalExpense = Number(expenseResult[0]?.value ?? 0);
    const count = Number(countResult[0]?.count ?? 0);

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      count,
    };
  }

  /**
   * Buscar template por ID
   */
  async findTemplateById(id: string): Promise<BudgetTemplate | null> {
    const result = await db.query.budgetTemplates.findFirst({
      where: eq(budgetTemplates.id, parseInt(id)),
    });

    if (!result) return null;
    return mapDbTemplateToDomain(result);
  }

  /**
   * Buscar todos os templates
   */
  async findAllTemplates(): Promise<BudgetTemplate[]> {
    const results = await db
      .select()
      .from(budgetTemplates)
      .orderBy(desc(budgetTemplates.createdAt));

    return results.map(mapDbTemplateToDomain);
  }

  /**
   * Criar template
   */
  async createTemplate(template: BudgetTemplate): Promise<BudgetTemplate> {
    const dbData = mapDomainTemplateToDb(template);

    const result = await db
      .insert(budgetTemplates)
      .values(dbData)
      .returning();

    return mapDbTemplateToDomain(result[0]);
  }

  /**
   * Construir cláusula WHERE dinâmica
   */
  private buildWhereClause(filters?: BudgetFilters) {
    const conditions: SQL[] = [];

    if (filters?.type) {
      conditions.push(eq(budget.type, filters.type));
    }

    if (filters?.status) {
      conditions.push(eq(budget.status, filters.status));
    }

    if (filters?.category) {
      conditions.push(eq(budget.category, filters.category));
    }

    if (filters?.dateFrom) {
      conditions.push(gte(budget.date, filters.dateFrom.toISOString().split('T')[0]));
    }

    if (filters?.dateTo) {
      conditions.push(lte(budget.date, filters.dateTo.toISOString().split('T')[0]));
    }

    if (filters?.connectedEpisodeId) {
      conditions.push(eq(budget.connectedEpisodeId, filters.connectedEpisodeId));
    }

    // Excluir deletados (soft delete)
    conditions.push(eq(budget.deletedAt, null));

    if (conditions.length === 0) {
      return undefined;
    }

    return conditions.length === 1 ? conditions[0] : and(...conditions);
  }
}
