/**
 * Budget Controller
 *
 * Controller HTTP para operações de Budget
 * Expõe endpoints RESTful para a API
 */

import { Elysia, t } from 'elysia';
import { CreateBudgetUseCase } from '@application/budget/use-cases/create-budget.use-case';
import { UpdateBudgetUseCase } from '@application/budget/use-cases/update-budget.use-case';
import { DeleteBudgetUseCase } from '@application/budget/use-cases/delete-budget.use-case';
import { ListBudgetsUseCase } from '@application/budget/use-cases/list-budgets.use-case';
import { GetBudgetUseCase } from '@application/budget/use-cases/get-budget.use-case';
import { GetBudgetSummaryUseCase } from '@application/budget/use-cases/get-budget-summary.use-case';
import { CreateBudgetTemplateUseCase } from '@application/budget/use-cases/create-budget-template.use-case';
import { ListBudgetTemplatesUseCase } from '@application/budget/use-cases/list-budget-templates.use-case';
import { ApplyBudgetTemplateUseCase } from '@application/budget/use-cases/apply-budget-template.use-case';
import { BudgetType } from '@domain/budget/value-objects/budget-type.enum';
import { BudgetStatus } from '@domain/budget/value-objects/budget-status.enum';

export class BudgetController {
  public routes: Elysia;

  constructor(
    private readonly createBudgetUseCase: CreateBudgetUseCase,
    private readonly updateBudgetUseCase: UpdateBudgetUseCase,
    private readonly deleteBudgetUseCase: DeleteBudgetUseCase,
    private readonly listBudgetsUseCase: ListBudgetsUseCase,
    private readonly getBudgetUseCase: GetBudgetUseCase,
    private readonly getBudgetSummaryUseCase: GetBudgetSummaryUseCase,
    private readonly createBudgetTemplateUseCase: CreateBudgetTemplateUseCase,
    private readonly listBudgetTemplatesUseCase: ListBudgetTemplatesUseCase,
    private readonly applyBudgetTemplateUseCase: ApplyBudgetTemplateUseCase
  ) {
    this.routes = this.createRoutes();
  }

  /**
   * Cria as rotas do controller
   */
  private createRoutes(): Elysia {
    return new Elysia({ prefix: '/budget' })
      // GET /budget - Listar todos os budgets
      .get(
        '/',
        async ({ query }) => {
          const filters = {
            page: query.page,
            limit: query.limit,
            type: query.type as BudgetType | undefined,
            status: query.status as BudgetStatus | undefined,
            category: query.category,
            dateFrom: query.dateFrom ? new Date(query.dateFrom) : undefined,
            dateTo: query.dateTo ? new Date(query.dateTo) : undefined,
            connectedEpisodeId: query.connectedEpisodeId,
          };

          const result = await this.listBudgetsUseCase.execute(filters);

          return {
            data: result.data.map((budget) => this.toResponse(budget)),
            pagination: {
              page: result.page,
              limit: result.limit,
              total: result.total,
              totalPages: result.totalPages,
            },
          };
        },
        {
          query: t.Object({
            page: t.Optional(t.Number()),
            limit: t.Optional(t.Number()),
            type: t.Optional(t.Enum(BudgetType)),
            status: t.Optional(t.Enum(BudgetStatus)),
            category: t.Optional(t.String()),
            dateFrom: t.Optional(t.String({ format: 'date-time' })),
            dateTo: t.Optional(t.String({ format: 'date-time' })),
            connectedEpisodeId: t.Optional(t.Number()),
          }),
        }
      )

      // GET /budget/summary - Obter resumo financeiro
      .get(
        '/summary',
        async ({ query }) => {
          const filters = {
            type: query.type as BudgetType | undefined,
            status: query.status as BudgetStatus | undefined,
            category: query.category,
            dateFrom: query.dateFrom ? new Date(query.dateFrom) : undefined,
            dateTo: query.dateTo ? new Date(query.dateTo) : undefined,
          };

          const summary = await this.getBudgetSummaryUseCase.execute(filters);

          return {
            totalIncome: summary.totalIncome,
            totalExpense: summary.totalExpense,
            balance: summary.balance,
            count: summary.count,
          };
        },
        {
          query: t.Optional(
            t.Object({
              type: t.Optional(t.Enum(BudgetType)),
              status: t.Optional(t.Enum(BudgetStatus)),
              category: t.Optional(t.String()),
              dateFrom: t.Optional(t.String({ format: 'date-time' })),
              dateTo: t.Optional(t.String({ format: 'date-time' })),
            })
          ),
        }
      )

      // GET /budget/:id - Buscar budget por ID
      .get(
        '/:id',
        async ({ params }) => {
          const budget = await this.getBudgetUseCase.execute({ id: params.id });
          return this.toResponse(budget);
        },
        {
          params: t.Object({
            id: t.String(),
          }),
        }
      )

      // POST /budget - Criar novo budget
      .post(
        '/',
        async ({ body }) => {
          const budget = await this.createBudgetUseCase.execute({
            concept: body.concept,
            amount: body.amount,
            type: body.type,
            category: body.category,
            date: body.date ? new Date(body.date) : undefined,
            responsible: body.responsible,
            status: body.status,
            connectedEpisodeId: body.connectedEpisodeId,
          });

          return this.toResponse(budget);
        },
        {
          body: t.Object({
            concept: t.String(),
            amount: t.Number(),
            type: t.Enum(BudgetType),
            category: t.String(),
            date: t.Optional(t.String({ format: 'date-time' })),
            responsible: t.Optional(t.String()),
            status: t.Optional(t.Enum(BudgetStatus)),
            connectedEpisodeId: t.Optional(t.Number()),
          }),
        }
      )

      // PUT /budget/:id - Atualizar budget
      .put(
        '/:id',
        async ({ params, body }) => {
          const budget = await this.updateBudgetUseCase.execute({
            id: params.id,
            concept: body.concept,
            amount: body.amount,
            type: body.type,
            category: body.category,
            date: body.date ? new Date(body.date) : undefined,
            responsible: body.responsible,
            status: body.status,
            connectedEpisodeId: body.connectedEpisodeId,
          });

          return this.toResponse(budget);
        },
        {
          params: t.Object({
            id: t.String(),
          }),
          body: t.Object({
            concept: t.Optional(t.String()),
            amount: t.Optional(t.Number()),
            type: t.Optional(t.Enum(BudgetType)),
            category: t.Optional(t.String()),
            date: t.Optional(t.String({ format: 'date-time' })),
            responsible: t.Optional(t.String()),
            status: t.Optional(t.Enum(BudgetStatus)),
            connectedEpisodeId: t.Optional(t.Number()),
          }),
        }
      )

      // DELETE /budget/:id - Deletar budget
      .delete(
        '/:id',
        async ({ params }) => {
          await this.deleteBudgetUseCase.execute({ id: params.id });
          return { success: true };
        },
        {
          params: t.Object({
            id: t.String(),
          }),
        }
      )

      // GET /budget/templates - Listar templates
      .get(
        '/templates',
        async () => {
          const templates = await this.listBudgetTemplatesUseCase.execute();
          return templates.map((template) => this.templateToResponse(template));
        }
      )

      // POST /budget/templates - Criar template
      .post(
        '/templates',
        async ({ body }) => {
          const template = await this.createBudgetTemplateUseCase.execute({
            name: body.name,
            items: body.items,
          });

          return this.templateToResponse(template);
        },
        {
          body: t.Object({
            name: t.String(),
            items: t.Array(
              t.Object({
                concept: t.String(),
                amount: t.Number(),
                type: t.Enum(BudgetType),
                category: t.String(),
              })
            ),
          }),
        }
      )

      // POST /budget/templates/:id/apply - Aplicar template
      .post(
        '/templates/:id/apply',
        async ({ params, body }) => {
          const result = await this.applyBudgetTemplateUseCase.execute({
            templateId: params.id,
            date: body.date ? new Date(body.date) : undefined,
            status: body.status,
          });

          return {
            templateName: result.templateName,
            appliedCount: result.appliedCount,
            budgets: result.budgets.map((budget) => this.toResponse(budget)),
          };
        },
        {
          params: t.Object({
            id: t.String(),
          }),
          body: t.Object({
            date: t.Optional(t.String({ format: 'date-time' })),
            status: t.Optional(t.Enum(BudgetStatus)),
          }),
        }
      );
  }

  /**
   * Mapeia Budget entity para resposta HTTP
   */
  private toResponse(budget: any): any {
    return {
      id: budget.id,
      concept: budget.concept,
      amount: budget.amount,
      type: budget.type,
      category: budget.category,
      date: budget.date instanceof Date ? budget.date.toISOString() : budget.date,
      responsible: budget.responsible,
      status: budget.status,
      connectedEpisodeId: budget.connectedEpisodeId,
      createdAt: budget.createdAt instanceof Date ? budget.createdAt.toISOString() : budget.createdAt,
      updatedAt: budget.updatedAt instanceof Date ? budget.updatedAt.toISOString() : budget.updatedAt,
    };
  }

  /**
   * Mapeia BudgetTemplate entity para resposta HTTP
   */
  private templateToResponse(template: any): any {
    return {
      id: template.id,
      name: template.name,
      items: template.items,
      itemCount: template.itemCount,
      totalIncome: template.getTotalIncome(),
      totalExpense: template.getTotalExpense(),
      balance: template.getBalance(),
      createdAt: template.createdAt instanceof Date ? template.createdAt.toISOString() : template.createdAt,
    };
  }
}
