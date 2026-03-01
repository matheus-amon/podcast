/**
 * Agenda Module Composition Root
 *
 * Configura injeção de dependência para o módulo Agenda
 * Este é o ponto de composição do módulo
 */

import { PostgresAgendaRepository } from '@infrastructure/database/adapters/agenda-repository.adapter';
import { AgendaController } from '@infrastructure/http/adapters/agenda.controller';
import { CreateEventUseCase } from '@application/agenda/use-cases/create-event.use-case';
import { UpdateEventUseCase } from '@application/agenda/use-cases/update-event.use-case';
import { CancelEventUseCase } from '@application/agenda/use-cases/cancel-event.use-case';
import { ListEventsUseCase } from '@application/agenda/use-cases/list-events.use-case';
import { GetEventUseCase } from '@application/agenda/use-cases/get-event.use-case';

/**
 * Cria e configura todas as dependências do módulo Agenda
 */
export function createAgendaModule(): AgendaController {
  // Infrastructure layer (repository adapter)
  const agendaRepository = new PostgresAgendaRepository();

  // Application layer (use cases)
  const createEventUseCase = new CreateEventUseCase(agendaRepository);
  const updateEventUseCase = new UpdateEventUseCase(agendaRepository);
  const cancelEventUseCase = new CancelEventUseCase(agendaRepository);
  const listEventsUseCase = new ListEventsUseCase(agendaRepository);
  const getEventUseCase = new GetEventUseCase(agendaRepository);

  // Infrastructure layer (HTTP controller)
  const agendaController = new AgendaController(
    createEventUseCase,
    updateEventUseCase,
    cancelEventUseCase,
    listEventsUseCase,
    getEventUseCase
  );

  return agendaController;
}
