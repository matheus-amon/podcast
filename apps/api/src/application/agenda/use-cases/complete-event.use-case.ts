/**
 * Complete Event Use Case
 *
 * Caso de uso para marcar um evento de agenda como completado
 */

import type { AgendaRepositoryPort } from '@domain/agenda/ports/agenda-repository.port';

export class CompleteEventUseCase {
  constructor(private readonly agendaRepository: AgendaRepositoryPort) {}

  /**
   * Executa o caso de uso para completar o evento
   */
  async execute(id: string): Promise<void> {
    // Buscar evento existente
    const existingEvent = await this.agendaRepository.findById(id);
    if (!existingEvent) {
      throw new Error('Event not found');
    }

    // Verificar se o evento já está cancelado
    if (existingEvent.isCancelled()) {
      throw new Error('Cannot complete a cancelled event');
    }

    // Completar o evento
    existingEvent.markAsCompleted();

    // Persistir atualização
    await this.agendaRepository.update(existingEvent);
  }
}
