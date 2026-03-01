/**
 * Create Event Use Case
 *
 * Caso de uso para criação de novos eventos de agenda
 * Orquestra a validação e persistência de um evento
 */

import { AgendaEvent, type CreateAgendaEventDTO } from '@domain/agenda/entities/agenda-event.entity';
import type { AgendaRepositoryPort } from '@domain/agenda/ports/agenda-repository.port';
import { EventType } from '@domain/agenda/value-objects/event-status.enum';

export class CreateEventUseCase {
  constructor(private readonly agendaRepository: AgendaRepositoryPort) {}

  /**
   * Executa o caso de uso de criação de evento
   */
  async execute(props: CreateAgendaEventDTO): Promise<AgendaEvent> {
    // Validar tipo de evento
    if (!this.isValidEventType(props.type)) {
      throw new Error('Invalid event type');
    }

    // Validar intervalo de datas
    this.validateDateRange(props.startAt, props.endAt);

    // Verificar conflito de horário para os participantes
    await this.checkTimeConflict(props.startAt, props.endAt, props.attendees || []);

    // Criar novo evento
    const event = AgendaEvent.create(props);

    // Persistir evento
    await this.agendaRepository.create(event);

    return event;
  }

  /**
   * Valida se o tipo de evento é válido
   */
  private isValidEventType(type: EventType): boolean {
    return Object.values(EventType).includes(type);
  }

  /**
   * Valida o intervalo de datas do evento
   */
  private validateDateRange(startAt: Date, endAt: Date): void {
    if (endAt <= startAt) {
      throw new Error('End date must be after start date');
    }

    const now = new Date();
    if (startAt < now) {
      throw new Error('Start date cannot be in the past');
    }
  }

  /**
   * Verifica se há conflito de horário para os participantes
   */
  private async checkTimeConflict(
    startAt: Date,
    endAt: Date,
    attendees: string[]
  ): Promise<void> {
    if (attendees.length === 0) {
      return;
    }

    // Buscar eventos existentes no intervalo de tempo
    const existingEvents = await this.agendaRepository.findByDateRange({
      start: startAt,
      end: endAt,
    });

    // Verificar conflito para cada participante
    for (const attendee of attendees) {
      const hasConflict = existingEvents.some((event) => {
        // Ignorar eventos cancelados
        if (event.isCancelled()) {
          return false;
        }

        // Verificar se o participante está no evento
        if (!event.attendees.includes(attendee)) {
          return false;
        }

        // Verificar sobreposição de horário
        return startAt < event.endAt && endAt > event.startAt;
      });

      if (hasConflict) {
        throw new Error(`Time conflict detected for attendee ${attendee}`);
      }
    }
  }
}
