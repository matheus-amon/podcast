/**
 * Login Controller
 *
 * HTTP controller for login endpoint
 */

import { Elysia, t } from 'elysia';
import { rateLimiter } from '../../../middleware/rate-limit';
import type { LoginUserUseCase } from '../../application/user/use-cases/login-user.use-case';

export class LoginController {
  public routes: Elysia;

  constructor(private readonly loginUseCase: LoginUserUseCase) {
    this.routes = this.createRoutes();
  }

  /**
   * Create login routes
   */
  private createRoutes(): Elysia {
    return new Elysia({ prefix: '/auth' })
      // POST /auth/login (Rate limit: 5 attempts per minute)
      .use(rateLimiter(5))
      .post(
        '/login',
        async ({ body }) => {
          const result = await this.loginUseCase.execute({
            email: body.email,
            password: body.password,
          });

          return {
            user: result.user,
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
          };
        },
        {
          body: t.Object({
            email: t.String({ format: 'email' }),
            password: t.String(),
          }),
          detail: {
            summary: 'Login user',
            description: 'Authenticate user with email and password',
            tags: ['Authentication'],
            responses: {
              200: {
                description: 'Login successful',
              },
              400: {
                description: 'Invalid input',
              },
              401: {
                description: 'Invalid credentials',
              },
              403: {
                description: 'Account deactivated',
              },
              429: {
                description: 'Too many requests - Rate limit exceeded',
              },
            },
          },
        }
      );
  }
}
