/**
 * Leads Module Composition Root
 * 
 * Configura injeção de dependência para o módulo Leads
 * Este é o ponto de composição do módulo
 */

import { PostgresLeadRepository } from '@infrastructure/database/adapters/lead-repository.adapter';
import { LeadController } from '@infrastructure/http/adapters/lead.controller';
import { CreateLeadUseCase } from '@application/leads/use-cases/create-lead.use-case';
import { UpdateLeadUseCase } from '@application/leads/use-cases/update-lead.use-case';
import { DeleteLeadUseCase } from '@application/leads/use-cases/delete-lead.use-case';
import { GetLeadsUseCase } from '@application/leads/use-cases/get-leads.use-case';

/**
 * Cria e configura todas as dependências do módulo Leads
 */
export function createLeadsModule(): LeadController {
  // Infrastructure layer (adapters)
  const leadRepository = new PostgresLeadRepository();

  // Application layer (use cases)
  const createLeadUseCase = new CreateLeadUseCase(leadRepository);
  const updateLeadUseCase = new UpdateLeadUseCase(leadRepository);
  const deleteLeadUseCase = new DeleteLeadUseCase(leadRepository);
  const getLeadsUseCase = new GetLeadsUseCase(leadRepository);

  // Infrastructure layer (HTTP controller)
  const leadController = new LeadController(
    createLeadUseCase,
    updateLeadUseCase,
    deleteLeadUseCase,
    getLeadsUseCase
  );

  return leadController;
}
