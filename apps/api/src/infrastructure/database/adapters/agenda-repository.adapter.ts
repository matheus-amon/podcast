/**
 * Postgres Agenda Repository Adapter
 *
 * Implementação do AgendaRepositoryPort usando PostgreSQL + Drizzle ORM
 * Adaptado para o schema existente da tabela 'agenda'
 */

import { AgendaEvent } from '@domain/agenda/entities/agenda-event.entity';
import { EventStatus, EventType } from '@domain/agenda/value-objects/event-status.enum';
import type { AgendaRepositoryPort, AgendaFilters, DateRange } from '@domain/agenda/ports/agenda-repository.port';
import { db } from '@db/index';
import { agenda, eventTypeEnum, eventStatusEnum } from '@db/schema';
import { eq, and, desc, or, gte, lte, type SQL, sql } from 'drizzle-orm';

export class PostgresAgendaRepository implements AgendaRepositoryPort {
  /**
   * Busca um evento pelo ID
   */
  async findById(id: string): Promise<AgendaEvent | null> {
    const result = await db.query.agenda.findFirst({
      where: and(
        eq(agenda.id, parseInt(id)),
        sql`${agenda.deletedAt} IS NULL`
      ),
    });

    if (!result) {
      return null;
    }

    return this.mapToAgendaEvent(result);
  }

  /**
   * Busca eventos por intervalo de datas
   */
  async findByDateRange(range: DateRange): Promise<AgendaEvent[]> {
    const results = await db.query.agenda.findMany({
      where: and(
        // Eventos que começam antes do fim do intervalo
        lte(agenda.startDate, range.end),
        // E terminam depois do início do intervalo
        gte(agenda.endDate, range.start),
        // Apenas eventos não deletados
        sql`${agenda.deletedAt} IS NULL`
      ),
      orderBy: [desc(agenda.startDate)],
    });

    return results.map((r) => this.mapToAgendaEvent(r));
  }

  /**
   * Busca eventos por participante
   */
  async findByAttendee(userId: string, range?: DateRange): Promise<AgendaEvent[]> {
    const conditions: SQL[] = [];

    // Filtrar por participante (busca no array JSONB de participants)
    conditions.push(sql`${agenda.participants} @> ${JSON.stringify([userId])}::jsonb`);

    // Apenas eventos não deletados
    conditions.push(sql`${agenda.deletedAt} IS NULL`);

    if (range) {
      conditions.push(lte(agenda.startDate, range.end));
      conditions.push(gte(agenda.endDate, range.start));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const results = await db.query.agenda.findMany({
      where: whereClause,
      orderBy: [desc(agenda.startDate)],
    });

    return results.map((r) => this.mapToAgendaEvent(r));
  }

  /**
   * Busca todos os eventos com filtros opcionais
   */
  async findAll(filters?: AgendaFilters): Promise<AgendaEvent[]> {
    const conditions: SQL[] = [];

    if (filters?.status) {
      conditions.push(eq(agenda.status, filters.status as any));
    }

    if (filters?.type) {
      conditions.push(eq(agenda.type, filters.type as any));
    }

    if (filters?.attendee) {
      conditions.push(sql`${agenda.participants} @> ${JSON.stringify([filters.attendee])}::jsonb`);
    }

    // Filtrar apenas eventos não deletados
    conditions.push(sql`${agenda.deletedAt} IS NULL`);

    const offset = filters?.offset ?? 0;
    const limit = filters?.limit ?? 20;

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const results = await db.query.agenda.findMany({
      where: whereClause,
      orderBy: [desc(agenda.startDate)],
      offset,
      limit,
    });

    return results.map((r) => this.mapToAgendaEvent(r));
  }

  /**
   * Cria um novo evento
   * Valida sobreposição de horário antes de criar
   */
  async create(event: AgendaEvent): Promise<void> {
    // Validação de sobreposição
    await this.validateOverlap(event);

    const obj = event.toObject();

    await db.insert(agenda).values({
      title: obj.title,
      description: obj.description || null,
      startDate: obj.startAt,
      endDate: obj.endAt,
      type: obj.type as any,
      status: obj.status as any,
      participants: obj.attendees || [],
      color: obj.color || '#3B82F6',
      createdAt: obj.createdAt,
      updatedAt: obj.updatedAt,
    });
  }

  /**
   * Atualiza um evento existente
   * Valida sobreposição de horário antes de atualizar
   */
  async update(event: AgendaEvent): Promise<void> {
    const obj = event.toObject();

    // Validação de sobreposição (excluindo o próprio evento)
    await this.validateOverlap(event, obj.id);

    await db
      .update(agenda)
      .set({
        title: obj.title,
        description: obj.description || null,
        startDate: obj.startAt,
        endDate: obj.endAt,
        type: obj.type as any,
        status: obj.status as any,
        participants: obj.attendees || [],
        color: obj.color || '#3B82F6',
        updatedAt: new Date(),
      })
      .where(eq(agenda.id, parseInt(obj.id)));
  }

  /**
   * Remove um evento (soft delete)
   */
  async delete(id: string): Promise<void> {
    await db
      .update(agenda)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(agenda.id, parseInt(id)));
  }

  /**
   * Valida se há sobreposição de horário com outros eventos
   * @param event - Evento a ser validado
   * @param excludeId - ID do evento a ser excluído da validação (para updates)
   * @throws Error se houver sobreposição
   */
  private async validateOverlap(event: AgendaEvent, excludeId?: string): Promise<void> {
    const obj = event.toObject();

    const conditions: SQL[] = [
      // Eventos que começam antes do fim do novo evento
      lte(agenda.startDate, obj.endAt),
      // E terminam depois do início do novo evento
      gte(agenda.endDate, obj.startAt),
      // Apenas eventos não deletados
      sql`${agenda.deletedAt} IS NULL`,
    ];

    // Excluir o próprio evento em caso de update
    if (excludeId) {
      conditions.push(sql`${agenda.id} != ${parseInt(excludeId)}`);
    }

    const overlappingEvent = await db.query.agenda.findFirst({
      where: and(...conditions),
    });

    if (overlappingEvent) {
      throw new Error(
        `Event overlap detected with event "${overlappingEvent.title}" ` +
        `(${overlappingEvent.startDate} to ${overlappingEvent.endDate})`
      );
    }
  }

  /**
   * Mapeia dados do banco para entity AgendaEvent
   */
  private mapToAgendaEvent(data: any): AgendaEvent {
    // Extrai participantes do JSONB
    const attendees = Array.isArray(data.participants) ? data.participants : [];

    return AgendaEvent.fromProps({
      id: data.id.toString(),
      title: data.title,
      description: data.description ?? undefined,
      startAt: data.startDate,
      endAt: data.endDate,
      type: data.type as EventType,
      status: data.status as EventStatus,
      attendees: attendees,
      color: data.color ?? '#3B82F6',
      createdAt: data.createdAt,
      updatedAt: data.updatedAt ?? data.createdAt,
      deletedAt: data.deletedAt ?? undefined,
    });
  }
}
