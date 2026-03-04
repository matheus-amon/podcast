/**
 * Refresh Token Controller
 * 
 * HTTP controller for token refresh endpoint
 */

import { Elysia, t } from 'elysia';
import type { RefreshTokenUseCase } from '../../application/user/use-cases/refresh-token.use-case';

export class RefreshTokenController {
  public routes: Elysia;

  constructor(private readonly refreshTokenUseCase: RefreshTokenUseCase) {
    this.routes = this.createRoutes();
  }

  /**
   * Create refresh token routes
   */
  private createRoutes(): Elysia {
    return new Elysia({ prefix: '/auth' })
      // POST /auth/refresh
      .post(
        '/refresh',
        async ({ body }) => {
          const result = await this.refreshTokenUseCase.execute({
            refreshToken: body.refreshToken,
          });

          return {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
          };
        },
        {
          body: t.Object({
            refreshToken: t.String(),
          }),
          detail: {
            summary: 'Refresh access token',
            description: 'Get new access token using refresh token',
            tags: ['Authentication'],
            responses: {
              200: {
                description: 'Token refreshed successfully',
              },
              401: {
                description: 'Invalid refresh token',
              },
            },
          },
        }
      );
  }
}
