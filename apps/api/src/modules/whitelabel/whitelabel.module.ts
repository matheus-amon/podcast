/**
 * Whitelabel Module Composition Root
 *
 * Configura injeção de dependência para o módulo Whitelabel
 * Este é o ponto de composição do módulo
 */

import { PostgresWhitelabelRepository } from '@infrastructure/database/adapters/whitelabel-repository.adapter';
import { WhitelabelController } from '@infrastructure/http/adapters/whitelabel.controller';
import { GetWhitelabelConfig } from '@application/whitelabel/use-cases/get-whitelabel-config.use-case';
import { UpdateWhitelabelConfig } from '@application/whitelabel/use-cases/update-whitelabel-config.use-case';

/**
 * Cria e configura todas as dependências do módulo Whitelabel
 */
export function createWhitelabelModule(): WhitelabelController {
  // Infrastructure layer (repository adapter)
  const whitelabelRepository = new PostgresWhitelabelRepository();

  // Application layer (use cases)
  const getConfigUseCase = new GetWhitelabelConfig(whitelabelRepository);
  const updateConfigUseCase = new UpdateWhitelabelConfig(whitelabelRepository);

  // Infrastructure layer (HTTP controller)
  const whitelabelController = new WhitelabelController(
    getConfigUseCase,
    updateConfigUseCase
  );

  return whitelabelController;
}
