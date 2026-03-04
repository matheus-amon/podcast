/**
 * Auth Controller
 *
 * HTTP controller for authentication endpoints
 */

import { Elysia, t } from 'elysia';
import { authGuardMiddleware } from '../../../middleware/auth-guard';
import type { RegisterUserUseCase } from '../../application/user/use-cases/register-user.use-case';

export class AuthController {
  public routes: Elysia;

  constructor(private readonly registerUseCase: RegisterUserUseCase) {
    this.routes = this.createRoutes();
  }

  /**
   * Create authentication routes
   */
  private createRoutes(): Elysia {
    return new Elysia({ prefix: '/auth' })
      // POST /auth/register
      .post(
        '/register',
        async ({ body }) => {
          const result = await this.registerUseCase.execute({
            email: body.email,
            password: body.password,
            name: body.name,
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
            password: t.String({ minLength: 8 }),
            name: t.String({ minLength: 2, maxLength: 100 }),
          }),
          detail: {
            summary: 'Register new user',
            description: 'Create a new user account with email and password',
            tags: ['Authentication'],
            responses: {
              201: {
                description: 'User registered successfully',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        user: {
                          type: 'object',
                          properties: {
                            id: { type: 'string', format: 'uuid' },
                            email: { type: 'string', format: 'email' },
                            name: { type: 'string' },
                            isActive: { type: 'boolean' },
                            createdAt: { type: 'string', format: 'date-time' },
                            updatedAt: { type: 'string', format: 'date-time' },
                          },
                        },
                        accessToken: { type: 'string' },
                        refreshToken: { type: 'string' },
                      },
                    },
                  },
                },
              },
              400: {
                description: 'Invalid input (validation error)',
              },
              409: {
                description: 'Email already registered',
              },
            },
          },
        }
      )
      // GET /auth/me - Protected route
      .use(authGuardMiddleware())
      .get(
        '/me',
        async ({ user, set }) => {
          if (!user) {
            set.status = 401;
            return {
              error: {
                code: 'UNAUTHORIZED',
                message: 'User not authenticated',
              },
            };
          }

          return {
            user: {
              userId: user.userId,
              email: user.email,
            },
          };
        },
        {
          detail: {
            summary: 'Get current user',
            description: 'Retrieve authenticated user information',
            tags: ['Authentication'],
            security: [{ bearerAuth: [] }],
            responses: {
              200: {
                description: 'User information retrieved successfully',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        user: {
                          type: 'object',
                          properties: {
                            userId: { type: 'string', format: 'uuid' },
                            email: { type: 'string', format: 'email' },
                          },
                        },
                      },
                    },
                  },
                },
              },
              401: {
                description: 'Unauthorized - Invalid or missing token',
              },
            },
          },
        }
      );
  }
}
