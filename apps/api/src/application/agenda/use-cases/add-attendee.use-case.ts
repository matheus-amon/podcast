/**
 * Add Attendee Use Case
 *
 * Caso de uso para adicionar um participante a um evento de agenda
 */

import type { AgendaRepositoryPort } from '@domain/agenda/ports/agenda-repository.port';

export class AddAttendeeUseCase {
  constructor(private readonly agendaRepository: AgendaRepositoryPort) {}

  /**
   * Executa o caso de uso de adição de participante
   */
  async execute(eventId: string, userId: string): Promise<void> {
    // Buscar evento existente
    const existingEvent = await this.agendaRepository.findById(eventId);
    if (!existingEvent) {
      throw new Error('Event not found');
    }

    // Verificar se o evento já foi cancelado
    if (existingEvent.isCancelled()) {
      throw new Error('Cannot add attendee to a cancelled event');
    }

    // Verificar se o evento já foi completado
    if (existingEvent.isCompleted()) {
      throw new Error('Cannot add attendee to a completed event');
    }

    // Verificar se o usuário já é participante
    if (existingEvent.attendees.includes(userId)) {
      throw new Error('User is already an attendee of this event');
    }

    // Verificar conflito de horário para o novo participante
    await this.checkTimeConflict(
      existingEvent.startAt,
      existingEvent.endAt,
      userId,
      existingEvent.id
    );

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
    attendee: string,
    excludeEventId: string
  ): Promise<void> {
    // Buscar eventos existentes no intervalo de tempo
    const existingEvents = await this.agendaRepository.findByDateRange({
      start: startAt,
      end: endAt,
    });

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
