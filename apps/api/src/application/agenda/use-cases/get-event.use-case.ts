/**
 * Get Event Use Case
 *
 * Caso de uso para busca de um evento específico por ID
 */

import { AgendaEvent } from '@domain/agenda/entities/agenda-event.entity';
import type { AgendaRepositoryPort } from '@domain/agenda/ports/agenda-repository.port';

export class GetEventUseCase {
  constructor(private readonly agendaRepository: AgendaRepositoryPort) {}

  /**
   * Executa o caso de uso de busca de evento por ID
   */
  async execute(id: string): Promise<AgendaEvent> {
    const event = await this.agendaRepository.findById(id);
    if (!event) {
      throw new Error('Event not found');
    }
    return event;
  }

  /**
   * Busca um evento por ID e verifica se está disponível para edição
   * (não cancelado e não completado)
   */
  async getEditable(id: string): Promise<AgendaEvent> {
    const event = await this.execute(id);

    if (event.isCancelled()) {
      throw new Error('Cannot edit a cancelled event');
    }

    if (event.isCompleted()) {
      throw new Error('Cannot edit a completed event');
    }

    return event;
  }
}
