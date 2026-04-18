/**
 * Complete Event Use Case
 *
 * Caso de uso para marcar um evento de agenda como concluído
 */

import type { AgendaRepositoryPort } from '@domain/agenda/ports/agenda-repository.port';

export class CompleteEventUseCase {
  constructor(private readonly agendaRepository: AgendaRepositoryPort) {}

  /**
   * Executa o caso de uso de marcação de evento como concluído
   */
  async execute(id: string): Promise<void> {
    // Buscar evento existente
    const existingEvent = await this.agendaRepository.findById(id);
    if (!existingEvent) {
      throw new Error('Event not found');
    }

    // Verificar se o evento já está completado
    if (existingEvent.isCompleted()) {
      throw new Error('Event is already completed');
    }

    // Verificar se o evento está cancelado
    if (existingEvent.isCancelled()) {
      throw new Error('Cannot complete a cancelled event');
    }

    // Marcar o evento como completado
    existingEvent.markAsCompleted();

    // Persistir atualização
    await this.agendaRepository.update(existingEvent);
  }
}
