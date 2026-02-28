/**
 * Lead Controller
 * 
 * Controller HTTP para operações de Leads
 * Expõe endpoints RESTful para a API
 */

import { Elysia, t } from 'elysia';
import { CreateLeadUseCase } from '@application/leads/use-cases/create-lead.use-case';
import { UpdateLeadUseCase } from '@application/leads/use-cases/update-lead.use-case';
import { DeleteLeadUseCase } from '@application/leads/use-cases/delete-lead.use-case';
import { GetLeadsUseCase } from '@application/leads/use-cases/get-leads.use-case';
import { LeadStatus } from '@domain/leads/value-objects/lead-status.enum';

export class LeadController {
  private readonly app: Elysia;

  constructor(
    private readonly createLeadUseCase: CreateLeadUseCase,
    private readonly updateLeadUseCase: UpdateLeadUseCase,
    private readonly deleteLeadUseCase: DeleteLeadUseCase,
    private readonly getLeadsUseCase: GetLeadsUseCase
  ) {
    this.app = this.createRoutes();
  }

  /**
   * Cria as rotas do controller
   */
  private createRoutes(): Elysia {
    return new Elysia({ prefix: '/leads' })
      // GET /leads - Listar todos os leads
      .get(
        '/',
        async ({ query }) => {
          const filters = {
            status: query.status as LeadStatus | undefined,
            assignedTo: query.assignedTo,
            source: query.source,
            offset: query.page ? (query.page - 1) * (query.limit ?? 20) : 0,
            limit: query.limit ?? 20,
          };

          const result = await this.getLeadsUseCase.execute(filters);

          return {
            data: result.data.map((lead) => this.toResponse(lead)),
            pagination: {
              page: query.page ?? 1,
              limit: query.limit ?? 20,
              total: result.total,
              totalPages: Math.ceil(result.total / (query.limit ?? 20)),
            },
          };
        },
        {
          query: t.Object({
            page: t.Optional(t.Number()),
            limit: t.Optional(t.Number()),
            status: t.Optional(t.Enum(LeadStatus)),
            assignedTo: t.Optional(t.String()),
            source: t.Optional(t.String()),
          }),
        }
      )

      // GET /leads/:id - Buscar lead por ID
      .get(
        '/:id',
        async ({ params }) => {
          const lead = await this.getLeadsUseCase.getById(params.id);
          return this.toResponse(lead);
        },
        {
          params: t.Object({
            id: t.String(),
          }),
        }
      )

      // POST /leads - Criar novo lead
      .post(
        '/',
        async ({ body }) => {
          const lead = await this.createLeadUseCase.execute({
            name: body.name,
            email: body.email,
            phone: body.phone,
            source: body.source,
            assignedTo: body.assignedTo,
          });

          return {
            id: lead.id,
            name: lead.name,
            email: lead.email,
            status: lead.status,
            createdAt: lead.createdAt,
          };
        },
        {
          body: t.Object({
            name: t.String(),
            email: t.String(),
            phone: t.Optional(t.String()),
            source: t.Optional(t.String()),
            assignedTo: t.Optional(t.String()),
          }),
        }
      )

      // PUT /leads/:id - Atualizar lead
      .put(
        '/:id',
        async ({ params, body }) => {
          const lead = await this.updateLeadUseCase.execute({
            id: params.id,
            name: body.name,
            email: body.email,
            phone: body.phone,
            status: body.status as LeadStatus,
            assignedTo: body.assignedTo,
          });

          return this.toResponse(lead);
        },
        {
          params: t.Object({
            id: t.String(),
          }),
          body: t.Object({
            name: t.Optional(t.String()),
            email: t.Optional(t.String()),
            phone: t.Optional(t.String()),
            status: t.Optional(t.Enum(LeadStatus)),
            assignedTo: t.Optional(t.String()),
          }),
        }
      )

      // DELETE /leads/:id - Remover lead
      .delete(
        '/:id',
        async ({ params }) => {
          await this.deleteLeadUseCase.execute(params.id);
          return { success: true };
        },
        {
          params: t.Object({
            id: t.String(),
          }),
        }
      );
  }

  /**
   * Converte Lead para formato de resposta HTTP
   */
  private toResponse(lead: any) {
    return {
      id: lead.id,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      status: lead.status,
      source: lead.source,
      assignedTo: lead.assignedTo,
      createdAt: lead.createdAt,
      updatedAt: lead.updatedAt,
    };
  }

  /**
   * Retorna a instância do Elysia com as rotas
   */
  get routes(): Elysia {
    return this.app;
  }
}
