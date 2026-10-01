/**
 * Remove Attendee Use Case
 *
 * Caso de uso para remover um participante de um evento de agenda
 */

import type { AgendaRepositoryPort } from '@domain/agenda/ports/agenda-repository.port';
import {
  AttendeeNotFoundError,
  EventCancelledError,
  EventNotFoundError,
} from '@domain/agenda/errors/agenda.error';

export class RemoveAttendeeUseCase {
  constructor(private readonly agendaRepository: AgendaRepositoryPort) {}

  /**
   * Executa o caso de uso para remover participante
   */
  async execute(eventId: string, userId: string): Promise<void> {
    // Buscar evento existente
    const existingEvent = await this.agendaRepository.findById(eventId);
    if (!existingEvent) {
      throw new EventNotFoundError(eventId);
    }

    // Verificar se o evento já está cancelado
    if (existingEvent.isCancelled()) {
      throw new EventCancelledError('remove attendee from');
    }

    // Same reason as the add path: `removeAttendee` splices nothing when the id
    // is absent, so without this the DELETE answers 200 having changed nothing.
    if (!existingEvent.attendees.includes(userId)) {
      throw new AttendeeNotFoundError(userId);
    }

    // Remover participante
    existingEvent.removeAttendee(userId);

    // Persistir atualização
    await this.agendaRepository.update(existingEvent);
  }
}
