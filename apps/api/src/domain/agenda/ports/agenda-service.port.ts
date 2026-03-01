/**
 * Agenda Service Port
 *
 * Interface que define as operações de serviço para Agenda
 * Contém regras de negócio que orquestram múltiplas operações
 */

import { AgendaEvent } from '../entities/agenda-event.entity';
import { CreateAgendaEventDTO } from '../entities/agenda-event.entity';
import { DateRange } from './agenda-repository.port';

export interface CreateEventDTO {
  title: string;
  description?: string;
  startAt: Date;
  endAt: Date;
  type: string;
  attendees: string[];
  color?: string;
}

export interface AgendaServicePort {
  /**
   * Verifica se há disponibilidade de horário para os participantes
   */
  checkAvailability(range: DateRange, attendees: string[]): Promise<boolean>;

  /**
   * Agenda um novo evento
   */
  scheduleEvent(eventData: CreateEventDTO): Promise<AgendaEvent>;

  /**
   * Reagenda um evento existente para novo horário
   */
  rescheduleEvent(eventId: string, newRange: DateRange): Promise<void>;

  /**
   * Cancela um evento
   */
  cancelEvent(eventId: string, reason: string): Promise<void>;

  /**
   * Marca um evento como completado
   */
  markAsCompleted(eventId: string): Promise<void>;
}
