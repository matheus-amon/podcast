/**
 * Remove Attendee Use Case
 *
 * Caso de uso para remover um participante de um evento de agenda
 */

import type { AgendaRepositoryPort } from '@domain/agenda/ports/agenda-repository.port';

export class RemoveAttendeeUseCase {
  constructor(private readonly agendaRepository: AgendaRepositoryPort) {}

  /**
   * Executa o caso de uso de remoção de participante
   */
  async execute(eventId: string, userId: string): Promise<void> {
    // Buscar evento existente
    const existingEvent = await this.agendaRepository.findById(eventId);
    if (!existingEvent) {
      throw new Error('Event not found');
    }

    // Verificar se o evento já foi cancelado
    if (existingEvent.isCancelled()) {
      throw new Error('Cannot remove attendee from a cancelled event');
    }

    // Verificar se o evento já foi completado
    if (existingEvent.isCompleted()) {
      throw new Error('Cannot remove attendee from a completed event');
    }

    // Remover participante
    existingEvent.removeAttendee(userId);

    // Persistir atualização
    await this.agendaRepository.update(existingEvent);
  }
}
