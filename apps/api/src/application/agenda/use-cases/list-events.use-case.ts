/**
 * List Events Use Case
 *
 * Caso de uso para listagem de eventos com filtros e paginação
 */

import { AgendaEvent } from '@domain/agenda/entities/agenda-event.entity';
import type { AgendaRepositoryPort, AgendaFilters, DateRange } from '@domain/agenda/ports/agenda-repository.port';

export interface ListEventsResult {
  data: AgendaEvent[];
  total: number;
}

export interface ListEventsFilters extends AgendaFilters {
  dateRange?: DateRange;
}

export class ListEventsUseCase {
  constructor(private readonly agendaRepository: AgendaRepositoryPort) {}

  /**
   * Executa o caso de uso de listagem de eventos
   */
  async execute(filters?: ListEventsFilters): Promise<ListEventsResult> {
    const data = await this.agendaRepository.findAll(filters);

    return {
      data,
      total: data.length,
    };
  }

  /**
   * Busca eventos por intervalo de datas
   */
  async getByDateRange(range: DateRange, filters?: Omit<AgendaFilters, 'offset' | 'limit'>): Promise<AgendaEvent[]> {
    return await this.agendaRepository.findByDateRange(range);
  }

  /**
   * Busca eventos por participante
   */
  async getByAttendee(userId: string, range?: DateRange): Promise<AgendaEvent[]> {
    return await this.agendaRepository.findByAttendee(userId, range);
  }

  /**
   * Busca eventos por tipo
   */
  async getByType(type: string, filters?: AgendaFilters): Promise<AgendaEvent[]> {
    const updatedFilters: AgendaFilters = {
      ...filters,
      type: type as any,
    };
    return await this.agendaRepository.findAll(updatedFilters);
  }

  /**
   * Busca eventos por status
   */
  async getByStatus(status: string, filters?: AgendaFilters): Promise<AgendaEvent[]> {
    const updatedFilters: AgendaFilters = {
      ...filters,
      status: status as any,
    };
    return await this.agendaRepository.findAll(updatedFilters);
  }
}
