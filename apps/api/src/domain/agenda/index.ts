/**
 * Agenda Domain Module
 *
 * Exporta todas as entidades, ports e value objects do módulo Agenda
 */

export { AgendaEvent, type AgendaEventProps, type CreateAgendaEventDTO } from './entities/agenda-event.entity';
export { EventType, EventStatus } from './value-objects/event-status.enum';
export type { AgendaRepositoryPort, DateRange, AgendaFilters } from './ports/agenda-repository.port';
