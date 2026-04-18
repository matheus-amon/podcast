/**
 * Add Attendee Use Case
 *
 * Caso de uso para adicionar participantes a eventos de agenda
 */

import type { AgendaRepositoryPort } from '@domain/agenda/ports/agenda-repository.port';

export class AddAttendeeUseCase {
  constructor(private readonly agendaRepository: AgendaRepositoryPort) {}

  /**
   * Executa o caso de uso de adicionar participante
   */
  async execute(id: string, userId: string): Promise<void> {
    // Buscar evento existente
    const existingEvent = await this.agendaRepository.findById(id);
    if (!existingEvent) {
      throw new Error('Event not found');
    }

    // Adicionar participante
    existingEvent.addAttendee(userId);

    // Persistir atualização
    await this.agendaRepository.update(existingEvent);
  }
}
