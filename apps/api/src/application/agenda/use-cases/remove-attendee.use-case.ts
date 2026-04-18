/**
 * Remove Attendee Use Case
 *
 * Caso de uso para remover participantes de eventos de agenda
 */

import type { AgendaRepositoryPort } from '@domain/agenda/ports/agenda-repository.port';

export class RemoveAttendeeUseCase {
  constructor(private readonly agendaRepository: AgendaRepositoryPort) {}

  /**
   * Executa o caso de uso de remover participante
   */
  async execute(id: string, userId: string): Promise<void> {
    // Buscar evento existente
    const existingEvent = await this.agendaRepository.findById(id);
    if (!existingEvent) {
      throw new Error('Event not found');
    }

    // Remover participante
    existingEvent.removeAttendee(userId);

    // Persistir atualização
    await this.agendaRepository.update(existingEvent);
  }
}
