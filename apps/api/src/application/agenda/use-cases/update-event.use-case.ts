/**
 * Update Event Use Case
 *
 * Caso de uso para atualização de eventos existentes
 */

import { AgendaEvent, type CreateAgendaEventDTO } from '@domain/agenda/entities/agenda-event.entity';
import type { AgendaRepositoryPort } from '@domain/agenda/ports/agenda-repository.port';
import { EventType } from '@domain/agenda/value-objects/event-status.enum';

export interface UpdateEventDTO extends Partial<Omit<CreateAgendaEventDTO, 'type'>> {
  id: string;
  type?: EventType;
}

export class UpdateEventUseCase {
  constructor(private readonly agendaRepository: AgendaRepositoryPort) {}

  /**
   * Executa o caso de uso de atualização de evento
   */
  async execute(props: UpdateEventDTO): Promise<AgendaEvent> {
    // Buscar evento existente
    const existingEvent = await this.agendaRepository.findById(props.id);
    if (!existingEvent) {
      throw new Error('Event not found');
    }

    // Verificar se o evento já foi cancelado
    if (existingEvent.isCancelled()) {
      throw new Error('Cannot update a cancelled event');
    }

    // Atualizar campos permitidos
    if (props.title !== undefined) {
      existingEvent.updateTitle(props.title);
    }

    if (props.description !== undefined) {
      existingEvent.updateDescription(props.description);
    }

    if (props.startAt !== undefined || props.endAt !== undefined) {
      const newStart = props.startAt || existingEvent.startAt;
      const newEnd = props.endAt || existingEvent.endAt;

      // Validar novo intervalo de datas
      this.validateDateRange(newStart, newEnd);

      // Verificar conflito de horário (excluindo o próprio evento)
      await this.checkTimeConflict(newStart, newEnd, existingEvent.attendees, existingEvent.id);

      existingEvent.reschedule(newStart, newEnd);
    }

    if (props.type !== undefined) {
      if (!this.isValidEventType(props.type)) {
        throw new Error('Invalid event type');
      }
      existingEvent.props.type = props.type;
      existingEvent.touch();
    }

    if (props.color !== undefined) {
      existingEvent.props.color = props.color;
      existingEvent.touch();
    }

    // Persistir atualizações
    await this.agendaRepository.update(existingEvent);

    return existingEvent;
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
  }

  /**
   * Verifica se há conflito de horário para os participantes
   */
  private async checkTimeConflict(
    startAt: Date,
    endAt: Date,
    attendees: string[],
    excludeEventId: string
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
        // Ignorar o próprio evento sendo atualizado
        if (event.id === excludeEventId) {
          return false;
        }

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
