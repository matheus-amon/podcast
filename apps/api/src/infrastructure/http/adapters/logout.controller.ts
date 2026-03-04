/**
 * Logout Controller
 * 
 * HTTP controller for logout endpoint
 */

import { Elysia } from 'elysia';
import type { LogoutUserUseCase } from '../../application/user/use-cases/logout-user.use-case';

export class LogoutController {
  public routes: Elysia;

  constructor(private readonly logoutUseCase: LogoutUserUseCase) {
    this.routes = this.createRoutes();
  }

  /**
   * Create logout routes
   */
  private createRoutes(): Elysia {
    return new Elysia({ prefix: '/auth' })
      // POST /auth/logout
      .post(
        '/logout',
        async () => {
          const result = await this.logoutUseCase.execute({
            userId: 'user-id', // Would come from auth context in real implementation
          });

          return result;
        },
        {
          detail: {
            summary: 'Logout user',
            description: 'Invalidate user session and revoke tokens',
            tags: ['Authentication'],
            responses: {
              200: {
                description: 'Logout successful',
              },
            },
          },
        }
      );
  }
}
