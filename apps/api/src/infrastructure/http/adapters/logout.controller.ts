/**
 * Logout Controller
 *
 * HTTP controller for logout endpoint
 */

import { Elysia, t } from 'elysia';
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
    return new Elysia() // NO prefix - will be mounted under /auth by AuthController
      // POST /logout
      .post(
        '/logout',
        async ({ headers, set }) => {
          // Get refresh token from Authorization header or body
          const authHeader = headers['authorization'];
          const refreshToken = authHeader?.replace('Bearer ', '') || '';

          const result = await this.logoutUseCase.execute({
            userId: 'user-id', // Would come from auth context in real implementation
            refreshToken: refreshToken || undefined,
          });

          set.status = 200;
          return result;
        },
        {
          body: t.Optional(
            t.Object({
              refreshToken: t.Optional(t.String()),
            })
          ),
          detail: {
            summary: 'Logout user',
            description: 'Invalidate user session and revoke tokens',
            tags: ['Authentication'],
            responses: {
              200: {
                description: 'Logout successful',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean' },
                        message: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
        }
      );
  }
}
