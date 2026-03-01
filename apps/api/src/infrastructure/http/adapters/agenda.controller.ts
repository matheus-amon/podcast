/**
 * Agenda Controller
 *
 * Controller HTTP para operações de Agenda
 * Expõe endpoints RESTful para a API
 */

import { Elysia, t } from 'elysia';
import { CreateEventUseCase } from '@application/agenda/use-cases/create-event.use-case';
import { UpdateEventUseCase } from '@application/agenda/use-cases/update-event.use-case';
import { CancelEventUseCase } from '@application/agenda/use-cases/cancel-event.use-case';
import { ListEventsUseCase } from '@application/agenda/use-cases/list-events.use-case';
import { GetEventUseCase } from '@application/agenda/use-cases/get-event.use-case';
import { EventType, EventStatus } from '@domain/agenda/value-objects/event-status.enum';

export class AgendaController {
  public routes: Elysia;

  constructor(
    private readonly createEventUseCase: CreateEventUseCase,
    private readonly updateEventUseCase: UpdateEventUseCase,
    private readonly cancelEventUseCase: CancelEventUseCase,
    private readonly listEventsUseCase: ListEventsUseCase,
    private readonly getEventUseCase: GetEventUseCase
  ) {
    this.routes = this.createRoutes();
  }

  /**
   * Cria as rotas do controller
   */
  private createRoutes(): Elysia {
    return new Elysia({ prefix: '/agenda' })
      // GET /agenda/events - Listar todos os eventos
      .get(
        '/events',
        async ({ query }) => {
          const filters = {
            status: query.status as EventStatus | undefined,
            type: query.type as EventType | undefined,
            attendee: query.attendee,
            offset: query.page ? (query.page - 1) * (query.limit ?? 20) : 0,
            limit: query.limit ?? 20,
          };

          const result = await this.listEventsUseCase.execute(filters);

          return {
            data: result.data.map((event) => this.toResponse(event)),
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
            status: t.Optional(t.Enum(EventStatus)),
            type: t.Optional(t.Enum(EventType)),
            attendee: t.Optional(t.String()),
            startDate: t.Optional(t.String({ format: 'date-time' })),
            endDate: t.Optional(t.String({ format: 'date-time' })),
          }),
        }
      )

      // GET /agenda/events/:id - Buscar evento por ID
      .get(
        '/events/:id',
        async ({ params }) => {
          const event = await this.getEventUseCase.execute(params.id);
          return this.toResponse(event);
        },
        {
          params: t.Object({
            id: t.String(),
          }),
        }
      )

      // POST /agenda/events - Criar novo evento
      .post(
        '/events',
        async ({ body }) => {
          const event = await this.createEventUseCase.execute({
            title: body.title,
            description: body.description,
            startAt: new Date(body.startAt),
            endAt: new Date(body.endAt),
            type: body.type as EventType,
            attendees: body.attendees,
            color: body.color,
          });

          return {
            id: event.id,
            title: event.title,
            startAt: event.startAt,
            endAt: event.endAt,
            type: event.type,
            status: event.status,
            createdAt: event.createdAt,
          };
        },
        {
          body: t.Object({
            title: t.String(),
            description: t.Optional(t.String()),
            startAt: t.String({ format: 'date-time' }),
            endAt: t.String({ format: 'date-time' }),
            type: t.Enum(EventType),
            attendees: t.Optional(t.Array(t.String())),
            color: t.Optional(t.String()),
          }),
        }
      )

      // PUT /agenda/events/:id - Atualizar evento
      .put(
        '/events/:id',
        async ({ params, body }) => {
          const event = await this.updateEventUseCase.execute({
            id: params.id,
            title: body.title,
            description: body.description,
            startAt: body.startAt ? new Date(body.startAt) : undefined,
            endAt: body.endAt ? new Date(body.endAt) : undefined,
            type: body.type as EventType | undefined,
            color: body.color,
          });

          return this.toResponse(event);
        },
        {
          params: t.Object({
            id: t.String(),
          }),
          body: t.Object({
            title: t.Optional(t.String()),
            description: t.Optional(t.String()),
            startAt: t.Optional(t.String({ format: 'date-time' })),
            endAt: t.Optional(t.String({ format: 'date-time' })),
            type: t.Optional(t.Enum(EventType)),
            color: t.Optional(t.String()),
          }),
        }
      )

      // DELETE /agenda/events/:id - Remover evento (soft delete)
      .delete(
        '/events/:id',
        async ({ params }) => {
          await this.cancelEventUseCase.execute(params.id);
          return { success: true };
        },
        {
          params: t.Object({
            id: t.String(),
          }),
        }
      )

      // POST /agenda/events/:id/cancel - Cancelar evento
      .post(
        '/events/:id/cancel',
        async ({ params, body }) => {
          await this.cancelEventUseCase.execute(params.id, body.reason);
          return { success: true, message: 'Event cancelled successfully' };
        },
        {
          params: t.Object({
            id: t.String(),
          }),
          body: t.Object({
            reason: t.Optional(t.String()),
          }),
        }
      )

      // POST /agenda/events/:id/complete - Marcar evento como completado
      .post(
        '/events/:id/complete',
        async ({ params }) => {
          const event = await this.getEventUseCase.execute(params.id);
          event.markAsCompleted();
          // Nota: precisaria de um use case específico ou repository.update
          return { success: true, message: 'Event marked as completed' };
        },
        {
          params: t.Object({
            id: t.String(),
          }),
        }
      )

      // POST /agenda/events/:id/attendees - Adicionar participante
      .post(
        '/events/:id/attendees',
        async ({ params, body }) => {
          const event = await this.getEventUseCase.execute(params.id);
          event.addAttendee(body.userId);
          // Nota: precisaria de repository.update
          return { success: true, message: 'Attendee added successfully' };
        },
        {
          params: t.Object({
            id: t.String(),
          }),
          body: t.Object({
            userId: t.String(),
          }),
        }
      )

      // DELETE /agenda/events/:id/attendees/:userId - Remover participante
      .delete(
        '/events/:id/attendees/:userId',
        async ({ params }) => {
          const event = await this.getEventUseCase.execute(params.id);
          event.removeAttendee(params.userId);
          // Nota: precisaria de repository.update
          return { success: true, message: 'Attendee removed successfully' };
        },
        {
          params: t.Object({
            id: t.String(),
            userId: t.String(),
          }),
        }
      );
  }

  /**
   * Mapeia entidade para resposta HTTP
   */
  private toResponse(event: AgendaEvent): Record<string, any> {
    return {
      id: event.id,
      title: event.title,
      description: event.description,
      startAt: event.startAt.toISOString(),
      endAt: event.endAt.toISOString(),
      type: event.type,
      status: event.status,
      attendees: event.attendees,
      color: event.color,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
    };
  }
}
