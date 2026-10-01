/**
 * Add Attendee Use Case
 *
 * Caso de uso para adicionar um participante a um evento de agenda
 */

import type { AgendaRepositoryPort } from '@domain/agenda/ports/agenda-repository.port';
import {
  AttendeeTimeConflictError,
  DuplicateAttendeeError,
  EventCancelledError,
  EventNotFoundError,
} from '@domain/agenda/errors/agenda.error';

export class AddAttendeeUseCase {
  constructor(private readonly agendaRepository: AgendaRepositoryPort) {}

  /**
   * Executa o caso de uso para adicionar participante
   */
  async execute(eventId: string, userId: string): Promise<void> {
    // Buscar evento existente
    const existingEvent = await this.agendaRepository.findById(eventId);
    if (!existingEvent) {
      throw new EventNotFoundError(eventId);
    }

    // Verificar se o evento já está cancelado
    if (existingEvent.isCancelled()) {
      throw new EventCancelledError('add attendee to');
    }

    // The duplicate check has to live here, not only in the entity.
    // `AgendaEvent.addAttendee` skips a userId that is already present, so
    // without this guard the second POST answered 200 {success: true} having
    // written nothing — a success response describing a write that never
    // happened, which is the hardest kind of bug to notice.
    if (existingEvent.attendees.includes(userId)) {
      throw new DuplicateAttendeeError(eventId, userId);
    }

    // Verificar conflito de horário
    await this.checkTimeConflict(existingEvent.startAt, existingEvent.endAt, userId, eventId);

    // Adicionar participante
    existingEvent.addAttendee(userId);

    // Persistir atualização
    await this.agendaRepository.update(existingEvent);
  }

  /**
   * Verifica se há conflito de horário para o participante
   */
  private async checkTimeConflict(
    startAt: Date,
    endAt: Date,
    userId: string,
    excludeEventId: string
  ): Promise<void> {
    // Buscar eventos do participante no intervalo
    const existingEvents = await this.agendaRepository.findByDateRange({
      start: startAt,
      end: endAt,
    });

    const hasConflict = existingEvents.some((event) => {
      // Ignorar o próprio evento
      if (event.id === excludeEventId) {
        return false;
      }

      // Ignorar eventos cancelados
      if (event.isCancelled()) {
        return false;
      }

      // Verificar se o usuário já está como participante de outro evento neste horário
      if (!event.attendees.includes(userId)) {
        return false;
      }

      // Verificar sobreposição de horário
      return startAt < event.endAt && endAt > event.startAt;
    });

    if (hasConflict) {
      throw new AttendeeTimeConflictError(userId);
    }
  }
}
