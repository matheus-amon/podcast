/**
 * Auth Module Composition Root
 *
 * Configura injeção de dependência para o módulo de autenticação
 */

import { PostgresUserRepository } from '../../infrastructure/database/adapters/user-repository.adapter';
import { PostgresRefreshTokenRepository } from '../../infrastructure/database/adapters/refresh-token-repository.adapter';
import { AuthController } from '../../infrastructure/http/adapters/auth.controller';
import { LogoutController } from '../../infrastructure/http/adapters/logout.controller';
import { RegisterUserUseCase } from '../../application/user/use-cases/register-user.use-case';
import { LogoutUserUseCase } from '../../application/user/use-cases/logout-user.use-case';

/**
 * Cria e configura todas as dependências do módulo de autenticação
 */
export function createAuthModule(): AuthController {
  // Infrastructure layer (repository adapters)
  const userRepository = new PostgresUserRepository();
  const refreshTokenRepository = new PostgresRefreshTokenRepository();

  // Application layer (use cases)
  const registerUseCase = new RegisterUserUseCase(userRepository);
  const logoutUseCase = new LogoutUserUseCase(refreshTokenRepository);

  // Infrastructure layer (HTTP controllers)
  const authController = new AuthController(registerUseCase);
  const logoutController = new LogoutController(logoutUseCase);

  // Combine routes into authController
  authController.routes.use(logoutController.routes);

  return authController;
}
