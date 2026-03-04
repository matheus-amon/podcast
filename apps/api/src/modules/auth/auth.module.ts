/**
 * Auth Module Composition Root
 * 
 * Configura injeção de dependência para o módulo de autenticação
 */

import { PostgresUserRepository } from '../../infrastructure/database/adapters/user-repository.adapter';
import { AuthController } from '../../infrastructure/http/adapters/auth.controller';
import { RegisterUserUseCase } from '../../application/user/use-cases/register-user.use-case';

/**
 * Cria e configura todas as dependências do módulo de autenticação
 */
export function createAuthModule(): AuthController {
  // Infrastructure layer (repository adapter)
  const userRepository = new PostgresUserRepository();

  // Application layer (use case)
  const registerUseCase = new RegisterUserUseCase(userRepository);

  // Infrastructure layer (HTTP controller)
  const authController = new AuthController(registerUseCase);

  return authController;
}
