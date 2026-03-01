/**
 * Cancel Event Use Case
 *
 * Caso de uso para cancelamento de eventos de agenda
 */

import type { AgendaRepositoryPort } from '@domain/agenda/ports/agenda-repository.port';

export class CancelEventUseCase {
  constructor(private readonly agendaRepository: AgendaRepositoryPort) {}

  /**
   * Executa o caso de uso de cancelamento de evento
   */
  async execute(id: string, reason?: string): Promise<void> {
    // Buscar evento existente
    const existingEvent = await this.agendaRepository.findById(id);
    if (!existingEvent) {
      throw new Error('Event not found');
    }

    // Verificar se o evento já está cancelado
    if (existingEvent.isCancelled()) {
      throw new Error('Event is already cancelled');
    }

    // Verificar se o evento já foi completado
    if (existingEvent.isCompleted()) {
      throw new Error('Cannot cancel a completed event');
    }

    // Cancelar o evento
    existingEvent.cancel(reason || 'No reason provided');

    // Persistir cancelamento
    await this.agendaRepository.update(existingEvent);
  }
}
