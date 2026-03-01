/**
 * Agenda Repository Port
 *
 * Interface que define as operações de repositório para Agenda
 * Segue o padrão Repository da arquitetura hexagonal
 */

import { AgendaEvent } from '../entities/agenda-event.entity';
import { EventStatus, EventType } from '../value-objects/event-status.enum';

export interface DateRange {
  start: Date;
  end: Date;
}

export interface AgendaFilters {
  status?: EventStatus;
  type?: EventType;
  attendee?: string;
  offset?: number;
  limit?: number;
}

export interface AgendaRepositoryPort {
  /**
   * Busca um evento pelo ID
   */
  findById(id: string): Promise<AgendaEvent | null>;

  /**
   * Busca eventos por intervalo de datas
   */
  findByDateRange(range: DateRange): Promise<AgendaEvent[]>;

  /**
   * Busca eventos por participante
   */
  findByAttendee(userId: string, range?: DateRange): Promise<AgendaEvent[]>;

  /**
   * Busca todos os eventos com filtros opcionais
   */
  findAll(filters?: AgendaFilters): Promise<AgendaEvent[]>;

  /**
   * Cria um novo evento
   */
  create(event: AgendaEvent): Promise<void>;

  /**
   * Atualiza um evento existente
   */
  update(event: AgendaEvent): Promise<void>;

  /**
   * Remove um evento (soft delete)
   */
  delete(id: string): Promise<void>;
}
